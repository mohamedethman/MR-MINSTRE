#!/usr/bin/env python3
"""
Export des anciennes colonnes BYTEA vers des fichiers + SQL de migration.

Utilisation:
  python scripts/export_legacy_media.py --output-dir "C:/tmp/domaines-assets"

Connexion PostgreSQL via variables d'environnement:
  PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD

Option recommandee pour migration complete (toutes tables):
  --full-sql-file export_all_tables_new_structure.sql
"""

from __future__ import annotations

import argparse
import base64
import binascii
import os
import re
import shutil
import subprocess
from pathlib import Path
from typing import Iterable

import psycopg2
from psycopg2.extras import DictCursor


MEDIA_MAPPINGS = [
    ("actualites", "id", "image", "actualites"),
    ("annonces", "id", "image", "annonces"),
    ("bibliotheque_fichier", "id", "fichier", "bibliotheque"),
    ("cabinet_du_ministre", "id", "fichier", "cabinet"),
    ("comptessociaux", "id", "icon", "icon"),
    ("informations", "id", "logo", "logo"),
    ("leministre", "id", "image", "le-ministre"),
    ("leministre", "id", "cvarabe", "cv-ar"),
    ("leministre", "id", "cvfrancais", "cv-fr"),
    ("lois", "id", "fichierarabe", "loi-ar"),
    ("lois", "id", "fichierfrancais", "loi-fr"),
    ("ministres", "id", "image", "ministere"),
    ("procedures_services", "id", "image", "procedure-image"),
    ("procedures_services", "id", "fichier", "procedure-file"),
    ("projets_images", "id", "image", "projet"),
    ("slides", "id", "image", "slide"),
    ("sous_etablissements", "id", "logo", "sous-etablissement"),
    ("structureadministrative", "id", "fichierarabe", "structure-ar"),
    ("structureadministrative", "id", "fichierfrancais", "structure-fr"),
    ("videos", "id", "fichier", "video"),
]


def detect_extension(content: bytes) -> str:
    if len(content) >= 4 and content[0:4] == b"\x89PNG":
        return "png"
    if len(content) >= 2 and content[0:2] == b"\xFF\xD8":
        return "jpg"
    if len(content) >= 4 and content[0:4] == b"%PDF":
        return "pdf"
    if len(content) >= 3 and content[0:3] == b"GIF":
        return "gif"
    if (
        len(content) >= 12
        and content[0:4] == b"RIFF"
        and content[8:12] == b"WEBP"
    ):
        return "webp"
    if len(content) >= 2 and content[0:2] == b"PK":
        # docx/xlsx/pptx sont des zip
        return "zip"
    return "bin"


def safe_sql_str(value: str) -> str:
    return value.replace("'", "''")


def looks_like_filename(value: str) -> bool:
    return bool(re.match(r"^[^\\/:*?\"<>|]+\.[A-Za-z0-9]{2,8}$", value))


def decode_media_value(conn, media) -> tuple[bytes | None, str]:
    if media is None:
        return None, "null"

    if isinstance(media, memoryview):
        return media.tobytes(), "bytea-memoryview"

    if isinstance(media, (bytes, bytearray)):
        return bytes(media), "bytea-bytes"

    if isinstance(media, str):
        raw = media.strip()
        if not raw:
            return None, "empty-string"

        if looks_like_filename(raw):
            return None, "already-filename"

        if raw.startswith("data:"):
            comma_idx = raw.find(",")
            if comma_idx > 0:
                payload = raw[comma_idx + 1 :]
                try:
                    return base64.b64decode(payload, validate=True), "data-uri-base64"
                except (binascii.Error, ValueError):
                    return None, "invalid-data-uri-base64"

        if raw.startswith("\\x"):
            try:
                return bytes.fromhex(raw[2:]), "hex-bytea-string"
            except ValueError:
                return None, "invalid-hex-bytea-string"

        # Tentative base64 texte
        if len(raw) >= 64 and re.fullmatch(r"[A-Za-z0-9+/=\r\n]+", raw):
            compact = raw.replace("\n", "").replace("\r", "")
            try:
                return base64.b64decode(compact, validate=True), "plain-base64-string"
            except (binascii.Error, ValueError):
                return None, "invalid-plain-base64-string"

        return None, "plain-text-or-unsupported"

    # Cas PostgreSQL OID (Large Object)
    if isinstance(media, int):
        if media <= 0:
            return None, "invalid-oid"
        try:
            lo = conn.lobject(oid=media, mode="rb")
            try:
                content = lo.read()
            finally:
                lo.close()
            if content:
                return content, "oid-large-object"
            return None, "empty-oid-large-object"
        except Exception:
            return None, "invalid-or-missing-oid-large-object"

    return None, f"unsupported-type:{type(media).__name__}"


def export_mapping(
    conn,
    cur,
    output_dir: Path,
    table: str,
    pk_col: str,
    media_col: str,
    prefix: str,
) -> tuple[int, list[str]]:
    sql = f"""
        SELECT {pk_col} AS row_id, {media_col} AS media
        FROM {table}
        WHERE {media_col} IS NOT NULL
    """
    cur.execute(sql)
    rows = cur.fetchall()

    update_statements: list[str] = []
    exported_count = 0
    skipped_count = 0
    reason_stats: dict[str, int] = {}

    for row in rows:
        row_id = row["row_id"]
        media = row["media"]
        content, reason = decode_media_value(conn, media)
        reason_stats[reason] = reason_stats.get(reason, 0) + 1
        if not content:
            skipped_count += 1
            continue

        extension = detect_extension(content)
        file_name = f"{prefix}-{row_id}-{media_col}.{extension}"
        file_path = output_dir / file_name
        file_path.write_bytes(content)

        update_sql = (
            f"UPDATE {table} "
            f"SET {media_col} = '{safe_sql_str(file_name)}' "
            f"WHERE {pk_col} = {row_id};"
        )
        update_statements.append(update_sql)
        exported_count += 1

    non_null_count = len(rows)
    details = ", ".join(f"{k}={v}" for k, v in sorted(reason_stats.items()))
    print(
        f"    details: non_null={non_null_count}, exported={exported_count}, skipped={skipped_count}"
        + (f" | {details}" if details else "")
    )
    return exported_count, update_statements


def iter_mappings() -> Iterable[tuple[str, str, str, str]]:
    for mapping in MEDIA_MAPPINGS:
        yield mapping


def build_pg_dump_command() -> list[str]:
    return [
        "pg_dump",
        "--data-only",
        "--inserts",
        "--column-inserts",
        "--no-owner",
        "--no-privileges",
        "--host",
        os.getenv("PGHOST", "localhost"),
        "--port",
        os.getenv("PGPORT", "5432"),
        "--username",
        os.getenv("PGUSER", ""),
        "--dbname",
        os.getenv("PGDATABASE", ""),
    ]


def generate_full_sql_export(output_file: Path, update_statements: list[str]) -> None:
    if shutil.which("pg_dump") is None:
        raise RuntimeError("pg_dump introuvable. Installe PostgreSQL client sur le serveur.")

    cmd = build_pg_dump_command()
    env = os.environ.copy()
    if os.getenv("PGPASSWORD"):
        env["PGPASSWORD"] = os.getenv("PGPASSWORD", "")

    dump_result = subprocess.run(
        cmd,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    if dump_result.returncode != 0:
        raise RuntimeError(
            "Echec pg_dump:\n"
            f"{dump_result.stderr.strip() or dump_result.stdout.strip()}"
        )

    with output_file.open("w", encoding="utf-8") as f:
        f.write("-- Export SQL complet (data-only) pour structure nouvelle\n")
        f.write("-- 1) Restaurer ce SQL dans la base cible (nouveau schema deja applique)\n")
        f.write("-- 2) Les colonnes media sont forcees vers les noms de fichiers ci-dessous\n\n")
        f.write("BEGIN;\n\n")
        f.write(dump_result.stdout)
        f.write("\n-- Mises a jour des colonnes media vers noms de fichiers\n")
        for stmt in update_statements:
            f.write(stmt + "\n")
        f.write("\nCOMMIT;\n")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--output-dir",
        required=True,
        help="Dossier de sortie pour les fichiers exportes",
    )
    parser.add_argument(
        "--sql-file",
        default="migration_update_media.sql",
        help="Nom du fichier SQL de mise a jour",
    )
    parser.add_argument(
        "--full-sql-file",
        default="export_all_tables_new_structure.sql",
        help="Nom du SQL complet (toutes tables, data-only + media string)",
    )
    parser.add_argument(
        "--single-file-only",
        action="store_true",
        help="Genere uniquement le SQL complet (sans migration_update_media.sql)",
    )
    args = parser.parse_args()

    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    sql_file_path = output_dir / args.sql_file
    full_sql_path = output_dir / args.full_sql_file

    conn = psycopg2.connect(
        host=os.getenv("PGHOST", "localhost"),
        port=os.getenv("PGPORT", "5432"),
        dbname=os.getenv("PGDATABASE"),
        user=os.getenv("PGUSER"),
        password=os.getenv("PGPASSWORD"),
    )

    total_exported = 0
    all_updates: list[str] = []

    try:
        with conn, conn.cursor(cursor_factory=DictCursor) as cur:
            for table, pk_col, media_col, prefix in iter_mappings():
                count, updates = export_mapping(
                    conn, cur, output_dir, table, pk_col, media_col, prefix
                )
                total_exported += count
                all_updates.extend(updates)
                print(f"[OK] {table}.{media_col}: {count} fichier(s) exporte(s)")

        if not args.single_file_only:
            with sql_file_path.open("w", encoding="utf-8") as f:
                f.write("-- SQL genere automatiquement par export_legacy_media.py\n")
                f.write("BEGIN;\n")
                for stmt in all_updates:
                    f.write(stmt + "\n")
                f.write("COMMIT;\n")

        generate_full_sql_export(full_sql_path, all_updates)

        print(f"\nTotal exporte: {total_exported} fichier(s)")
        if not args.single_file_only:
            print(f"Fichier SQL: {sql_file_path}")
        print(f"Fichier SQL complet: {full_sql_path}")
        print(f"Dossier assets: {output_dir}")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())

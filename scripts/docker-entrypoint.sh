#!/bin/sh

# Bind-mounted backup dirs must be owned by uid 1000 on the HOST (chown from inside the
# container is not permitted on most bind mounts). This script only creates subdirs.
prepare_backup_storage() {
  storage_path="${BACKUP_STORAGE_PATH:-}"
  [ -n "$storage_path" ] || return 0

  if [ ! -d "$storage_path" ]; then
    echo "docker-entrypoint: BACKUP_STORAGE_PATH is not mounted: $storage_path" >&2
    echo "docker-entrypoint: mount a writable volume at that path in compose." >&2
    return 0
  fi

  if ! mkdir -p \
    "$storage_path/bundles" \
    "$storage_path/work" \
    "$storage_path/uploads" \
    "$storage_path/restore" 2>/dev/null
  then
    echo "docker-entrypoint: backup storage is not writable by uid $(id -u): $storage_path" >&2
    echo "docker-entrypoint: on the host run: sudo chown -R 1000:1000 <backup-host-path>" >&2
    return 0
  fi
}

prepare_backup_storage
exec "$@"

#!/bin/sh

set -e

SERVER_DIR="build/server"
CLIENT_DIR="build/client"


for var in VITE_API_BASE_URL VITE_API_RETRIES VITE_CUSTOM_HEADERS VITE_API_TIMEOUT VITE_REALM VITE_INTERNAL_BASE_URL; do
    eval value=\$$var
    if [ -z "$value" ]; then
        echo "Warning: missing environment variable $var"
    fi
done

# Escape for sed (handles pipes and slashes)
escape_sed(){
  printf '%s\n' "$1" | sed 's/[&/\|]/\\&/g'
}


escape_VITE_API_BASE_URL=$(escape_sed "$VITE_API_BASE_URL")
escape_VITE_API_RETRIES=$(escape_sed "$VITE_API_RETRIES")
escape_VITE_API_TIMEOUT=$(escape_sed "$VITE_API_TIMEOUT")
escape_VITE_CUSTOM_HEADERS=$(escape_sed "$VITE_CUSTOM_HEADERS")
escape_VITE_REALM=$(escape_sed "$VITE_REALM")
escape_VITE_INTERNAL_BASE_URL=$(escape_sed "$VITE_INTERNAL_BASE_URL")

for dir in "$SERVER_DIR" "$CLIENT_DIR"; do
  echo "Processing files in $dir..."
  if [ -d "$dir" ]; then
    find  "$dir" -name "*.js" -type f | while read -r file; do
      echo  " Start sedding  file: $file"

      if sed --version >/dev/null 2>&1; then
          # " Linux "
          sed -i "s|__VITE_API_BASE_URL__|${escape_VITE_API_BASE_URL}|g" "$file"
          sed -i  "s|__VITE_API_RETRIES__|${escape_VITE_API_RETRIES}|g" "$file"
          sed -i "s|__VITE_API_TIMEOUT__|${escape_VITE_API_TIMEOUT}|g" "$file"
          sed -i "s|__VITE_CUSTOM_HEADERS__|${escape_VITE_CUSTOM_HEADERS}|g" "$file"
          sed -i "s|__VITE_REALM__|${escape_VITE_REALM}|g" "$file"
          sed -i "s|__VITE_INTERNAL_BASE_URL__|${escape_VITE_INTERNAL_BASE_URL}|g" "$file"
      else
         # " MacOs "
         sed -i '' "s|__VITE_API_BASE_URL__|${escape_VITE_API_BASE_URL}|g" "$file"
         sed -i '' "s|__VITE_API_RETRIES__|${escape_VITE_API_RETRIES}|g" "$file"
         sed -i '' "s|__VITE_API_TIMEOUT__|${escape_VITE_API_TIMEOUT}|g" "$file"
         sed -i '' "s|__VITE_CUSTOM_HEADERS__|${escape_VITE_CUSTOM_HEADERS}|g" "$file"
         sed -i '' "s|__VITE_REALM__|${escape_VITE_REALM}|g" "$file"
         sed -i '' "s|__VITE_INTERNAL_BASE_URL__|${escape_VITE_INTERNAL_BASE_URL}|g" "$file"
      fi

    done
    echo " Replace placeholders in ${dir} JS files"
  fi
done

exec "$@"






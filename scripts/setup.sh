# Script for setting up prerequisites

if command -v node &> /dev/null; then
  echo "Node.js version $(node --version) found"
else
  echo "Node.js not found, please install and rerun"
  exit 1
fi

NODE_VERSION=$(node --version | sed "s/\.[[:digit:]][[:digit:]\.]*//g; s/v//")
if test $NODE_VERSION -lt 18; then
  echo "Node.js Version less than 18 detected, please upgrade"
  exit 1
fi

if command -v pnpm &> /dev/null; then
  echo "pnpm version $(pnpm --version) found"
else
  while true; do
    read -p "pnpm not found, would you like us to install it? [Y/n]: " yn
    case $yn in
      [Yy]* ) npm install -g pnpm; break;;
      [Nn]* ) echo "Aborting..."; exit 1;;
      * ) echo "Please answer with a yes or no.";;
    esac
  done
fi

echo "Installing dependencies..."
pnpm install

if ! test .env; then
  echo "Creating file for environment variables..."
  cp .env.example .env
else
  echo "Found environment variables"
fi

if ! command -v sqlite3 &> /dev/null; then
  echo "SQLite not installed, please follow Prisma's instructions on installing SQLite: https://www.prisma.io/dataguide/sqlite/setting-up-a-local-sqlite-database"
else
  echo "Found SQLite version $(sqlite3 --version | sed 's/ .*//')"
fi

echo "Successfully setup tooling, please follow instructions in INSTRUCTIONS.md to setup services and launch the application"

set -e
cd `dirname "$0"`
cd ..
 
rm -Rf node_modules/ package-lock.json
npm cache clean --force

printf "\n  Done. Now you can (re)do npm install; gulp optimise; gulp servedev\n"

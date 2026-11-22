FROM node:22.23.5-bookworm-slim AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases .yarn/releases
COPY .yarn/plugins .yarn/plugins
# Skip install scripts: they only build optional native addons (bufferutil, keccak...) the build does not need
RUN node .yarn/releases/yarn-4.6.0.cjs install --immutable --mode=skip-build
COPY . .
# Then keep only the server's runtime dependencies (the browser bundle is in dist)
RUN node .yarn/releases/yarn-4.6.0.cjs build \
  && node .yarn/releases/yarn-4.6.0.cjs workspaces focus --production

FROM node:22.23.5-bookworm-slim
# The app never installs packages at runtime: drop npm, npx, corepack and yarn (and their CVEs)
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx \
  /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn-*
WORKDIR /app
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/dist dist
COPY package.json server.cjs vite.config.ts ./
ENV NODE_ENV=production PORT=5173
USER node
EXPOSE 5173
CMD ["node", "server.cjs"]

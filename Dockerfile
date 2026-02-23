FROM node:20.19-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20.19-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20.19-alpine AS build-env

COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build && npm audit fix

FROM node:20.19-alpine

COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
COPY ./env.sh /app/
WORKDIR /app

RUN chmod +x /app/env.sh && chown -R 100:100 /app

# Set as environment variables for runtime
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_RETRIES=${VITE_API_RETRIES}
ENV VITE_CUSTOM_HEADERS=${VITE_CUSTOM_HEADERS}
ENV VITE_API_TIMEOUT=${VITE_API_TIMEOUT}
ENV VITE_REALM=${VITE_REALM}
ENV VITE_INTERNAL_BASE_URL=${VITE_INTERNAL_BASE_URL}
ENV TZ="Africa/Johannesburg"


USER 100

EXPOSE 3000

ENTRYPOINT ["/app/env.sh"]

CMD ["npm", "run", "start"]
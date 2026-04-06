import nextConfig from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

const config = [...nextConfig, ...nextTypeScript]

export default config

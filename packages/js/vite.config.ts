import { copyFileSync, readdirSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const config = () => {
  return defineConfig({
    build: {
      emptyOutDir: false, // keep the dist folder to avoid errors with pnpm go when folder is empty during build
      minify: "terser",
      sourcemap: true,
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: {
          app: resolve(__dirname, "src/app.ts"),
          website: resolve(__dirname, "src/website.ts"),
        },
        name: "formbricksJsWrapper",
        formats: ["es", "cjs"],
      },
    },
    plugins: [
      dts({ rollupTypes: true, bundledPackages: ["@formbricks/js-core"] }),
      // Custom plugin to copy all files to the second output folder
      {
        name: "copy-output",
        closeBundle() {
          const outputDir = resolve(__dirname, "../../apps/web/public/js");
          const distDir = resolve(__dirname, "dist");

          // Get all files in the dist folder
          const filesToCopy = readdirSync(distDir);

          filesToCopy.forEach((file) => {
            const srcFile = `${distDir}/${file}`;
            const destFile = `${outputDir}/${file}`;
            copyFileSync(srcFile, destFile);
          });

          console.log(`Copied ${filesToCopy.length} files to ${outputDir}`);
        },
      },
    ],
  });
};

export default config;

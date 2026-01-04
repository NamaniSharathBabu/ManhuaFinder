// Declare minimal `process.env` to avoid TypeScript errors in build environments
// that may not install devDependencies (e.g., @types/node).
// Adjust or extend as you add more env vars.

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY?: string;
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};

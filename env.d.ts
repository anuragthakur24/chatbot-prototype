declare namespace NodeJS {
    interface ProcessEnv {
        DATABASE_URL: string;
        DIRECT_URL?: string;
        JWT_SECRET: string;
        GROQ_API_KEY: string;
        NODE_ENV: "development" | "production" | "test";
        NEXT_PUBLIC_APP_URL?: string;
    }
}

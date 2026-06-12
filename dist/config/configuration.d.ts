declare const _default: () => {
    port: number;
    mongodb: {
        uri: string;
    };
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpires: string;
        refreshExpires: string;
    };
    redis: {
        url: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
    };
    razorpay: {
        keyId: string;
        keySecret: string;
        webhookSecret: string;
        xAccountNumber: string;
        payoutMode: "IMPS" | "NEFT" | "RTGS";
        payoutMock: boolean;
    };
    cors: {
        origin: string[];
    };
    frontendUrl: string;
    media: {
        publicBase: string;
        uploadDir: string;
        maxVideoMb: number;
    };
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
        s3Bucket: string;
        s3PublicBase: string;
        s3Enabled: boolean;
    };
    platform: {
        userId: string;
    };
    mail: {
        webhookUrl: string;
        from: string;
    };
};
export default _default;

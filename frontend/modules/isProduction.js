export default function isProduction() {
    return process.env.PRODUCTION === 'TRUE';
}
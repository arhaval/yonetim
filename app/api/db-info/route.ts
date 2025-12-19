export const runtime = "nodejs"; // Prisma için node runtime

export async function GET() {
  const u = new URL(process.env.DATABASE_URL!);
  const info = { host: u.hostname, port: u.port, user: u.username, db: u.pathname };

  console.log("DB_INFO", info);
  return Response.json(info);
}

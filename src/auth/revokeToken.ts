import  prisma  from "@/lib/prisma";

export const revokeToken = async (tokenValue: string) => {
  await prisma.token.updateMany({
    where: { tokenValue },
    data: { revoked: true },
  });
};

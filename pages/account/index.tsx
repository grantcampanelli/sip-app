import {authOptions} from "pages/api/auth/[...nextauth]";
import {getServerSession} from "next-auth";
import {GetServerSideProps} from "next";
import prisma from "../../lib/prismadb";
import {Prisma} from "@prisma/client";
import { signOut } from "next-auth/react";

import {
    Container,
    Group,
    Button,
    Stack,
} from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";



type UserWithFullData = Prisma.UserGetPayload<{
    include: {
        accounts: true
    }
}>;

export const getServerSideProps: GetServerSideProps = async ({
                                                                 req,
                                                                 res,
                                                                 query,
                                                             }) => {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
        res.statusCode = 403;
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }
    let userId: string = session.user.id;
    let user: UserWithFullData | null = null;
    user =
        (await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                accounts: true
            }
        })) || null;
    return {
        props: {user}
    };
};

type Props = {
    user: UserWithFullData;
    // bottles: BottleWithFullData[];
    // bottleFlatRowData: BottleFlatRow[];
};

const Account: React.FC<Props> = (props) => {
    const handleExport = async () => {
        try {
            const response = await fetch("/api/export");
            if (!response.ok) {
                throw new Error("Export failed");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `sip-app-export-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export error:", error);
            alert("Failed to export data. Please try again.");
        }
    };

    return (
        <Container>
            <Group justify="space-between" h="100%">
                <Group>
                    <h2>{props.user.name}</h2>
                </Group>
                <Group>
                    <Button onClick={() => signOut()}>Log Out</Button>
                </Group>
            </Group>
            <Stack mt="xl" gap="md">
                <h3>Email: {props.user.email}</h3>
                <Button
                    leftSection={<IconDownload size={16} />}
                    onClick={handleExport}
                    variant="outline"
                >
                    Export Data to CSV
                </Button>
            </Stack>
        </Container>
    );
};

export default Account;

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
} from "@mantine/core";



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
            <h3>Email: {props.user.email}</h3>
        </Container>
    );
};

export default Account;

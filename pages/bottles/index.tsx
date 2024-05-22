import {authOptions} from "pages/api/auth/[...nextauth]";
import {getServerSession} from "next-auth";
import {GetServerSideProps} from "next";
import prisma from "../../lib/prismadb";
import {Prisma} from "@prisma/client";

// next imports
import Link from "next/link";

// mantine imports
import {
    Container,
    Group,
    Card,
    Text,
    TextInput,
    rem,
    keys, ActionIcon, Tooltip, Menu
} from "@mantine/core";
import {
    IconSearch,
    IconAdjustmentsHorizontal,
    IconSquarePlus,
    IconHistory,
} from "@tabler/icons-react";
import {useState} from "react";

type BottleWithFullData = Prisma.BottleGetPayload<{
    include: {
        product: {
            include: {
                brand: true;
            };
        };
    };
}>;

type BottleFlatRow = {
    id: string;
    bottleName: string;
    brandName: string;
    purchaseDate: string;
    year: string;
    type: string;
};

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
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

    const bottles: BottleWithFullData[] = await prisma.bottle.findMany({
        where: {
            userId: session?.user?.id,
            finished: false,
        },
        include: {
            product: {
                include: {
                    brand: true,
                },
            },
        },
    });

    const bottleFlatRowData: BottleFlatRow[] = bottles.map((bottle) => {
        return {
            id: bottle.id,
            bottleName: bottle.product.name,
            brandName: bottle.product.brand.name,
            purchaseDate: bottle.purchaseDate?.toLocaleDateString() || '',
            year: bottle.product.vintage.toString(),
            type: bottle.product.brand.type,
        };
    });

    return {
        props: {bottles, bottleFlatRowData}
    };
};

type Props = {
    bottles: BottleWithFullData[];
    bottleFlatRowData: BottleFlatRow[];
};

const Bottles: React.FC<Props> = (props) => {
    interface BottleRowData {
        id: string;
        bottleName: string;
        brandName: string;
        purchaseDate: string;
        year: string;
        type: string;
    }

    function filterData(data: BottleRowData[], search: string) {
        const query = search.toLowerCase().trim();
        return data.filter((item) =>
            keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
        );
    }

    function sortData(
        data: BottleRowData[],
        payload: {
            sortBy: keyof BottleRowData | null;
            reversed: boolean;
            search: string;
        }
    ) {
        const {sortBy} = payload;

        if (!sortBy) {
            return filterData(data, payload.search);
        }

        return filterData(
            [...data].sort((a, b) => {
                if (payload.reversed) {
                    return b[sortBy].localeCompare(a[sortBy]);
                }

                return a[sortBy].localeCompare(b[sortBy]);
            }),
            payload.search
        );
    }

    const [search, setSearch] = useState("");
    const [sortedData, setSortedData] = useState(props.bottleFlatRowData);
    const [sortBy, setSortBy] = useState<keyof BottleRowData | null>(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    const setSorting = (field: keyof BottleRowData) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(
            sortData(props.bottleFlatRowData, {sortBy: field, reversed, search})
        );
    };

    const filterBottleTypeTo = (type: string) => {

        if(type == "NONE"){
            setSortedData(props.bottleFlatRowData);
            return;
        }
        else {
            const filteredData = props.bottleFlatRowData.filter((bottle) => bottle.type === type);
            setSortedData(filteredData);
            return;
        }

    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.currentTarget;
        setSearch(value);
        setSortedData(
            sortData(props.bottleFlatRowData, {
                sortBy,
                reversed: reverseSortDirection,
                search: value,
            })
        );
    };
    const rows = sortedData.map((row) => (
        <Card
            key={row.id}
            shadow="sm"
            padding="md"
            radius="md"
            pt={20}
            mt={5}
            withBorder>
            <Card.Section>
                <Link
                    style={{textDecoration: "none"}}
                    href={`/bottles/${row.id}`}
                >
                    <Text
                        size="lg"
                        fw={800}
                        ta="left"
                        pl={20}
                        pr={20}
                        variant="gradient"
                        gradient={{from: "red", to: "maroon", deg: 90}}

                    >
                        {row.brandName} {row.bottleName} {row.year}
                    </Text>
                    <Text
                        size="sm"
                        fw={800}
                        ta="left"
                        pl={20}
                        pr={20}
                        variant="gradient"
                        gradient={{from: "red", to: "maroon", deg: 90}}>
                        Purchase Date: {row.purchaseDate}
                    </Text>
                </Link>
            </Card.Section>
        </Card>
    ));

    return (
        <Container>
            <Group justify="space-between" h="100%" pl="10px" pt="10px">
                <Group>
                    <h1>My Bottles</h1>
                </Group>
                <Group>
                    <Tooltip label={"Add Bottle"} position={"left"}><ActionIcon color={"green"} component={Link} href="/bottles/add"> <IconSquarePlus/></ActionIcon></Tooltip>
                    <Tooltip label={"View History"} position={"left"}><ActionIcon component={Link} href="/bottles/history"> <IconHistory/></ActionIcon></Tooltip>
                </Group>

            </Group>
            <Container>
                <Group justify="space-between" gap="xs" >
                <TextInput
                    placeholder="Search by any field"

                    leftSection={
                        <IconSearch
                            style={{width: rem(16), height: rem(16)}}
                            stroke={1.5}
                        />
                    }
                    value={search}
                    onChange={handleSearchChange}
                />
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <ActionIcon>
                                <IconAdjustmentsHorizontal/>
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item onClick={() => filterBottleTypeTo("WINE")}>Filter to Wine</Menu.Item>
                            <Menu.Item onClick={() => filterBottleTypeTo("BEER")}>Filter to Beer</Menu.Item>
                            <Menu.Item onClick={() => filterBottleTypeTo("SPIRIT")}>Filter to Spirit</Menu.Item>
                            <Menu.Item onClick={() => filterBottleTypeTo("NONE")}>Clear Filter</Menu.Item>

                        </Menu.Dropdown>
                    </Menu>
                </Group>

            </Container>
            <Container>
                {rows.map((row) => (
                    row
                ))}

            </Container>
        </Container>
    );
};

export default Bottles;

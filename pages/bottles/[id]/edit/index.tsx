import { authOptions } from "pages/api/auth/[...nextauth]";
import { getSession, useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { Bottle, Product, Brand, Prisma } from "@prisma/client";
import type { Session } from "inspector";
import { GetServerSideProps } from "next";
import prisma from "../../../../lib/prismadb";
import Link from "next/link";
import Router from "next/router";
import { modals } from "@mantine/modals";
import '@mantine/dates/styles.css';


import {
    Container,
    Button,
    Grid,
    Group,
    Text,
    Modal,
    Box,
    TextInput,
    NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import {DateTimePicker} from "@mantine/dates";
import React from "react";


type BottleWithFullData = Prisma.BottleGetPayload<{
    include: {
        product: {
            include: {
                brand: true;
            };
        };
        shelfItem: {
            include: {
                shelf: {
                    include: {
                        stash: true;
                    };
                };
            };
        };
    };
}>;

export const getServerSideProps: GetServerSideProps = async ({
                                                                 req,
                                                                 res,
                                                                 query,
                                                             }) => {
    const session = await getServerSession(req, res, authOptions);

    let bottleId: string = Array.isArray(query.id) ? "" : query.id || "";
    if (!session) {
        res.statusCode = 403;

        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }
    let bottle: Bottle | null = null;
    bottle =
        (await prisma.bottle.findUnique({
            where: {
                id: bottleId,
            },
            include: {
                product: {
                    include: {
                        brand: true,
                    },
                },
                shelfItem: {
                    include: {
                        shelf: {
                            include: {
                                stash: true,
                            },
                        },
                    },
                },
            },
        })) || null;

    return {
        props: {
            bottle,
        },
    };
};

type Props = {
    bottle: BottleWithFullData;
};

const BottlePage: React.FC<Props> = (props) => {
    const form = useForm({
        // mode: 'uncontrolled',
        initialValues: {
            purchasePrice: props.bottle.purchasePrice,
            notes: props.bottle.notes,
            purchaseDate: props.bottle.purchaseDate,
            amountRemaining: props.bottle.amountRemaining,
        },
        // validate: (values) => {
        //     if (active === 0) {
        //         return {
        //             brand:
        //                 values.brand === '' ? 'Brand must be selected' : null,
        //         };
        //     }
        //
        //     if (active === 1) {
        //         if(values.product === '') {return {product: 'Product must be selected'}}
        //         else {
        //             let specificBrand = props.productsDb.filter((product) => {
        //                 return product.id === values.product;
        //             })[0];
        //             if (specificBrand !== undefined) {
        //                 let specificBrandId = specificBrand.brandId;
        //                 return {
        //                     product: values.brand != specificBrandId ? 'Product must be from the selected brand' : null,
        //                 };
        //             }
        //         }
        //
        //     }
        //     if (values.amountRemaining < 0) {
        //     return {};
        // },
    });

    return (
        <Container>
            <h1>
                {props.bottle.product.brand.type == "WINE"
                    ? props.bottle.product.vintage
                    : null}{" "}
                {props.bottle.product.name}
            </h1>
            <form onSubmit={form.onSubmit((values) =>
                {
                    console.log("submitting form", values);
                    fetch(`/api/bottles/${props.bottle.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(values),
                    }).then((res) => {
                        if (res.ok) {
                            Router.push(`/bottles/${props.bottle.id}`);
                        }
                    });
                }
            )}>

                <NumberInput
                    label="Purchase Price"
                    key={"purchasePrice"}
                    value={props.bottle.purchasePrice || 0}
                    {...form.getInputProps("purchasePrice")}
                />
                <DateTimePicker
                    withAsterisk
                    dropdownType="modal"
                    label="Purchase Date"
                    placeholder="Pick a date"
                    {...form.getInputProps("purchaseDate")}
                />
                <TextInput
                    label="Notes"
                    key={"notes"}
                    value={props.bottle.notes || ""}
                    {...form.getInputProps("notes")}/>

                <NumberInput
                    label="Amount Remaining"
                    key={"amountRemaining"}
                    value={props.bottle.amountRemaining || 0}
                    {...form.getInputProps("amountRemaining")}
                />
                <Group justify="flex-end" mt="md">
                    <Button
                    component={Link}
                    href={`/bottles/${props.bottle.id}`}
                    >Cancel</Button>
                    <Button type="submit">Save</Button>
                </Group>
            </form>
                {/*<strong>Purchase Price:</strong> {props.bottle.purchasePrice}*!/*/}
                {/*<Text>*/}
                {/*    {props.bottle.shelfItem ? (*/}
                {/*        <p>*/}
                {/*            <strong>Location:</strong>{" "}*/}
                {/*            {props.bottle.shelfItem.shelf.stash?.name}*/}
                {/*            {" | "}*/}
                {/*            <Link href={`/shelves/${props.bottle.shelfItem.shelf.id}`}>*/}
                {/*                {props.bottle.shelfItem.shelf.name}*/}
                {/*            </Link>*/}
                {/*        </p>*/}
                {/*    ) : null}*/}
                {/*</Text>*/}
                {/*<p>*/}
                {/*    <strong>Purchase Price:</strong> {props.bottle.purchasePrice}*/}
                {/*</p>*/}
                {/*{props.bottle.finished ? (*/}
                {/*    <p>*/}
                {/*        <strong>Finished Date:</strong> {String(props.bottle.finishDate)}*/}
                {/*    </p>*/}
                {/*) : null}*/}
                {/*<h3>Notes:</h3>*/}
                {/*<p>{props.bottle.notes}</p>*/}
                {/*<h3>Actions:</h3>*/}

        </Container>
);
};

export default BottlePage;

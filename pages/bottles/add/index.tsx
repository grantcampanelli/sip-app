import React, {useState} from "react";
import {GetServerSideProps} from "next";
import {getServerSession} from "next-auth";
import prisma from "lib/prismadb";
import {authOptions} from "pages/api/auth/[...nextauth]";
import Router from "next/router";
import {
    Container,
    Button,
    Text,
    TextInput,
    NumberInput,
    Group,
    Select,
    Stepper,
    ComboboxData,
} from "@mantine/core";
import {useForm} from "@mantine/form";
import type {Product, Brand} from "@prisma/client";
import {DatePickerInput} from "@mantine/dates";
import {IconCurrencyDollar, IconPlus} from '@tabler/icons-react';
import '@mantine/dates/styles.css';

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

    const brandsDb: Brand[] = await prisma.brand.findMany({});
    const brandComboBox = brandsDb.map((brand) => {
        return {value: brand.id, label: brand.name};
    });

    const productsDb: Product[] = await prisma.product.findMany({});
    const productComboBox = productsDb.map((product) => {
        return {
            value: product.id,
            label: product.name + " "+ product.vintage+ " (Brand: " + brandsDb.filter((brand) => {
                return brand.id === product.brandId;
            })[0].name + ")" };
    });

    return {
        props: {brandComboBox, productComboBox, productsDb},
    };
};

type Props = {
    brandComboBox: ComboboxData;
    productComboBox: ComboboxData;
    productsDb: Product[];
};
// var productsFiltered: ComboboxData = [];

const CreateBottleForm: React.FC<Props> = (props) => {
    let productsFiltered: ComboboxData = props.productComboBox;

    const [active, setActive] = useState(0);

    const form = useForm({
        // mode: 'uncontrolled',
        initialValues: {
            product: '',
            brand: '',
            size: 25,
            servingSize: 9,
            purchasePrice: 19.99,
            purchaseDate: new Date(),
            openDate: null,
            finished: false,
            finishDate: null,
            amountRemaining: 100.0,
            notes: "",
        },

        validate: (values) => {
            if (active === 0) {
                return {
                    brand:
                        values.brand === '' ? 'Brand must be selected' : null,
                };
            }

            if (active === 1) {
                if(values.product === '') {return {product: 'Product must be selected'}}
                else {
                    let specificBrand = props.productsDb.filter((product) => {
                        return product.id === values.product;
                    })[0];
                    if (specificBrand !== undefined) {
                        let specificBrandId = specificBrand.brandId;
                        return {
                            product: values.brand != specificBrandId ? 'Product must be from the selected brand' : null,
                        };
                    }
                }

            }
            return {};
        },
    });

    form.watch('brand', ({previousValue, value, touched, dirty}) => {

        const products = props.productsDb.filter((product) => {
            return product.brandId === value;
        });
        productsFiltered = products.map((productFilt) => {
            return {value: productFilt.id, label: productFilt.name};
        });
        if (previousValue !== value) {
            form.setValues({product: ""});
        }
    });

    const nextStep = () =>
        setActive((current) => {
            if (form.validate().hasErrors) {
                return current;
            }
            return current < 3 ? current + 1 : current;
        });

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const addBottle = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        try {
            const body = {
                size: form.values.size,
                servingSize: form.values.servingSize,
                purchasePrice: form.values.purchasePrice,
                purchaseDate: form.values.purchaseDate,
                openDate: form.values.openDate,
                finished: false,
                finishDate: null,
                amountRemaining: 100.0,
                notes: form.values.notes,
                productId: form.values.product,
                brandId: form.values.brand,
            };
            await fetch("/api/bottles", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            });
            // need to return back to right fridge page
            const url = "/bottles/";
            await Router.push(url);
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <>
            <Container>
                <Stepper active={active}>
                    <Stepper.Step label="Pick Brand" description="First Step">
                            <Select
                            label="Brand"
                            key={"brand"}
                            withAsterisk
                            placeholder="Start typing..."
                            limit={10}
                            data={props.brandComboBox}
                            searchable
                            {...form.getInputProps("brand")}
                        />

                    </Stepper.Step>

                    <Stepper.Step label="Pick Product" description="Second Step">
                        <Select
                            label="Product"
                            key={"product"}
                            withAsterisk
                            placeholder="Start typing..."
                            limit={5}
                            data={productsFiltered}
                            searchable
                            {...form.getInputProps("product")}
                        />
                    </Stepper.Step>

                    <Stepper.Step label="Purchase Information" description="Third Step">
                        {/*<NumberInput*/}
                        {/*    withAsterisk*/}
                        {/*    label="Size in Ounces"*/}
                        {/*    placeholder="25"*/}
                        {/*    {...form.getInputProps("size")}*/}
                        {/*/>*/}
                        {/*<NumberInput*/}
                        {/*    withAsterisk*/}
                        {/*    label="Serving Size in Ounces"*/}
                        {/*    placeholder="9"*/}
                        {/*    {...form.getInputProps("servingSize")}*/}
                        {/*/>*/}
                        <NumberInput
                            withAsterisk
                            leftSection={<IconCurrencyDollar/>}
                            label="Purchase Price"
                            placeholder="20.00"
                            {...form.getInputProps("purchasePrice")}
                        />
                        <DatePickerInput
                            withAsterisk
                            label="Purchase Date"
                            placeholder="Pick a date"
                            {...form.getInputProps("purchaseDate")}
                        />
                        {/*<DateTimePicker*/}
                        {/*    label="Open Date"*/}
                        {/*    dropdownType="modal"*/}
                        {/*    placeholder="Pick a date"*/}
                        {/*    {...form.getInputProps("openDate")}*/}
                        {/*/>*/}
                        <TextInput
                            label="Notes"
                            placeholder="This is a great wine"
                            {...form.getInputProps("notes")}
                        />
                    </Stepper.Step>
                    <Stepper.Completed>
                        <Text>Loading...</Text>
                    </Stepper.Completed>
                </Stepper>

                <Group justify="flex-end" mt="xl">
                    {active !== 0 && (
                        <Button variant="default" onClick={prevStep}>
                            Back
                        </Button>
                    )}
                    {active === 0 && <Button color="green" component="a" href={"/brands"}><IconPlus/>Brand</Button>}
                    {active === 1 && <Button color="green" component="a" href={`/brands/${form.values.brand}`}><IconPlus/>Product</Button>}
                    {active !== 2 && <Button onClick={nextStep}>Next step</Button>}
                    {active === 2 && <Button onClick={addBottle}>Add Bottle</Button>}
                </Group>
            </Container>
        </>
    );
};

export default CreateBottleForm;

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
    Modal,
    ComboboxData,
} from "@mantine/core";
import {useForm} from "@mantine/form";
import type {Product, Brand} from "@prisma/client";
import {DatePickerInput} from "@mantine/dates";
import {IconCurrencyDollar, IconPlus} from '@tabler/icons-react';
import '@mantine/dates/styles.css';
import {useDisclosure} from "@mantine/hooks";


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
            label: product.name + " "+ product.vintage
        };
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

const CreateBottleForm: React.FC<Props> = (props) => {
    const [productsFiltered, setProductsFiltered] = useState(props.productComboBox);

    const [active, setActive] = useState(0);
    const form = useForm({
        initialValues: {
            product: '',
            brand: '',
            size: 25,
            servingSize: 9,
            numberBottles: 1,
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
        let newProductsFiltered = products.map((productFilt) => {
            return {value: productFilt.id, label: productFilt.name +" "+ productFilt.vintage};
        });
        setProductsFiltered(newProductsFiltered);
        console.log("productsFiltered: ", productsFiltered);
        if (previousValue !== value) {
            form.setValues({product: ""});
        }
    });

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
            for(let i = 0; i < form.values.numberBottles; i++) {
                await fetch("/api/bottles", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(body),
                });
            }
            const url = "/bottles/";
            await Router.push(url);
        } catch (error) {
            console.error(error);
        }
    };

    const [opened, { open, close }] = useDisclosure(false);

    const newBrandForm = useForm({
        initialValues: {
            brandName: "",
            type: "WINE",
        }
    });

    const saveNewBrand = async () => {
        try {
            const body = {
                name: newBrandForm.values.brandName,
                type: newBrandForm.values.type,
            };
            await fetch("/api/brands", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            });
            Router.reload();
            close();
        } catch (error) {
            console.error(error);
        }
    }

    const newBrandModal = () => {
        return (
            <>
                <TextInput
                    withAsterisk
                    key={"brandName"}
                    label="Name"
                    placeholder="Justin"
                    {...newBrandForm.getInputProps("brandName")}
                />
                <Select
                    withAsterisk
                    key={"brandType"}
                    label="Type"
                    placeholder="Select type"
                    value={newBrandForm.values.type}
                    data={[
                        { label: "Wine", value: "WINE" },
                        { label: "Spirits", value: "SPIRIT" },
                        { label: "Beer", value: "BEER" },
                    ]}
                    {...newBrandForm.getInputProps("type")}
                />
                <Button fullWidth onClick={() => saveNewBrand()} mt="md">
                    Submit
                </Button>
            </>
        );
    };

    const newProductForm = useForm({
        initialValues: {
            productName: "",
            productVintage: "2024",
            productVarietal: "",
            productRegion: "",
        }
    });

    const saveNewProduct = async () => {
        try {
            const body = {
                name: newProductForm.values.productName,
                vintage: newProductForm.values.productVintage,
                varietal: newProductForm.values.productVarietal,
                region: newProductForm.values.productRegion,
                brandId: form.values.brand,
            };
            await fetch("/api/products", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            });
            Router.reload();
            close();
        } catch (error) {
            console.error(error);
        }
    }

    // create a new product modal
    const newProductModal = () => {
        return (
            <>
                <TextInput
                    withAsterisk
                    key={"productName"}
                    label="Name"
                    placeholder="Justin"
                    {...newProductForm.getInputProps("productName")}
                />
                <TextInput
                    withAsterisk
                    key={"productVintage"}
                    label="Year"
                    placeholder="2024"
                    {...newProductForm.getInputProps("productVintage")}
                />
                <TextInput
                    key={"productVarietal"}
                    label="Varietal"
                    placeholder="Chardonnay"
                    {...newProductForm.getInputProps("productVarietal")}
                />
                <TextInput
                    key={"productRegion"}
                    label="Region"
                    placeholder="Napa Valley"
                    {...newProductForm.getInputProps("productRegion")}
                />
                <Button fullWidth onClick={() => saveNewProduct()} mt="md">
                    Submit
                </Button>
            </>
        );
    };

    // Code to step through the UI Stepper
    const nextStep = () =>
        setActive((current) => {
            if (form.validate().hasErrors) {
                return current;
            }
            return current < 3 ? current + 1 : current;
        });

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

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
                        <NumberInput
                            withAsterisk
                            // leftSection={<IconCurrencyDollar/>}
                            min={1}
                            label="How Many Bottles?"
                            startValue={1}
                            required={true}
                            {...form.getInputProps("numberBottles")}
                        />
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

                    {active === 0 && <Button color="green" onClick={open}><IconPlus/>Brand</Button>}
                    {active === 1 && <Button color="green" onClick={open}><IconPlus/>Product</Button>}
                    {active !== 2 && <Button onClick={nextStep}>Next step</Button>}
                    {active === 2 && <Button onClick={addBottle}>Add Bottle</Button>}
                </Group>

                <Modal opened={opened} onClose={close} title={active === 0 ? "Add New Brand" : "Add New Product"}>
                    {active === 0 ? newBrandModal() : null}
                    {active === 1 ? newProductModal() : null}
                </Modal>

            </Container>
        </>
    );
};

export default CreateBottleForm;

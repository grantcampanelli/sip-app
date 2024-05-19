import React, {useState} from "react";
import {GetServerSideProps} from "next";
import {getServerSession} from "next-auth";
import prisma from "lib/prismadb";
import {authOptions} from "pages/api/auth/[...nextauth]";
import Router from "next/router";
import {
    Container,
    Button,
    Input,
    Textarea,
    Box,
    TextInput,
    NumberInput,
    Checkbox,
    Group,
    Select,
    ComboboxData, Autocomplete,
    Stepper, Code, PasswordInput
} from "@mantine/core";
import {useForm} from "@mantine/form";
import type {Bottle, Product, Brand} from "@prisma/client";
import {DateTimePicker} from "@mantine/dates";

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
        return {value: product.id, label: product.name};
    });

    return {
        props: {brandComboBox, productComboBox},
    };
};

type Props = {
    //   brands: Brand[];
    brandComboBox: ComboboxData;
    productComboBox: ComboboxData;
};
var productsFiltered: ComboboxData = [];

const CreateBottleForm: React.FC<Props> = (props) => {
    var productsFiltered: ComboboxData = props.productComboBox;

    const [active, setActive] = useState(0);

    const form = useForm({
        // mode: 'uncontrolled',
        initialValues: {
            productId: '',
            brandId: '',
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
                    // username:
                    //     values.username.trim().length < 6
                    //         ? 'Username must include at least 6 characters'
                    //         : null,
                    // password:
                    //     values.password.length < 6 ? 'Password must include at least 6 characters' : null,
                };
            }

            if (active === 1) {
                return {
                    // name: values.name.trim().length < 2 ? 'Name must include at least 2 characters' : null,
                    // email: /^\S+@\S+$/.test(values.email) ? null : 'Invalid email',
                };
            }

            return {};
        },

      onValuesChange: (values) => {
             // updateProductList(values.brandId);
           console.log("values: ", values);
           },


    });

    form.watch('name', ({ previousValue, value, touched, dirty }) => {
        console.log({ previousValue, value, touched, dirty });
    });
    // form.watch((values) => {console.log("try")});




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
                            placeholder="Justin"
                            limit={5}
                            data={props.brandComboBox}
                            searchable
                            {...form.getInputProps("brandId")}
                        />
                    </Stepper.Step>

                    <Stepper.Step label="Pick Product" description="Second Step">
                        <Select
                            label="Product"
                            placeholder="Isoceles"
                            limit={5}
                            data={productsFiltered}
                            searchable
                            {...form.getInputProps("productId")}
                        />
                    </Stepper.Step>

                    <Stepper.Step label="Purchase Information" description="Third Step">
                        <NumberInput
                            withAsterisk
                            label="Size in Ounces"
                            placeholder="25"
                            {...form.getInputProps("size")}
                        />
                        <NumberInput
                            withAsterisk
                            label="Serving Size in Ounces"
                            placeholder="9"
                            {...form.getInputProps("servingSize")}
                        />
                        <NumberInput
                            withAsterisk
                            label="Purchase Price"
                            placeholder="20.00"
                            {...form.getInputProps("purchasePrice")}
                        />
                        <DateTimePicker
                            withAsterisk
                            dropdownType="modal"
                            label="Purchase Date"
                            placeholder="Pick a date"
                            {...form.getInputProps("purchaseDate")}
                        />
                        <DateTimePicker
                            label="Open Date"
                            dropdownType="modal"
                            placeholder="Pick a date"
                            {...form.getInputProps("openDate")}
                        />
                        <TextInput
                            withAsterisk
                            label="Notes"
                            placeholder="This is a great wine"
                            {...form.getInputProps("notes")}
                        />
                    </Stepper.Step>
                    <Stepper.Completed>
                        Completed! Form values:
                        {/*<Code block mt="xl">*/}
                        {/*  {JSON.stringify(form.getValues(), null, 2)}*/}
                        {/*</Code>*/}
                    </Stepper.Completed>
                </Stepper>

                <Group justify="flex-end" mt="xl">
                    {active !== 0 && (
                        <Button variant="default" onClick={prevStep}>
                            Back
                        </Button>
                    )}
                    {active !== 3 && <Button onClick={nextStep}>Next step</Button>}
                </Group>
            </Container>
        </>
    );
};

export default CreateBottleForm;

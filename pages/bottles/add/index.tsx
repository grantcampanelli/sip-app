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
    const [productsFiltered, setProductsFiltered] = useState<Array<{value: string, label: string}>>(props.productComboBox as Array<{value: string, label: string}>);
    const [brandsList, setBrandsList] = useState<Array<{value: string, label: string}>>(props.brandComboBox as Array<{value: string, label: string}>);
    const [brandSearchValue, setBrandSearchValue] = useState('');
    const [isCreatingBrand, setIsCreatingBrand] = useState(false);
    const [productSearchValue, setProductSearchValue] = useState('');
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);

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
        setIsCreatingBrand(true);
        try {
            const body = {
                name: newBrandForm.values.brandName,
                type: newBrandForm.values.type,
            };
            const response = await fetch("/api/brands", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            });
            
            if (response.ok) {
                const newBrand = await response.json();
                
                // Add the new brand to the brands list
                const newBrandOption = { value: newBrand.id, label: newBrand.name };
                setBrandsList([...brandsList, newBrandOption]);
                
                // Set the newly created brand as selected
                form.setValues({ brand: newBrand.id });
                
                // Reset the brand search value
                setBrandSearchValue('');
                
                // Reset the form
                newBrandForm.reset();
                close();
            } else {
                console.error('Failed to create brand');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreatingBrand(false);
        }
    }

    const handleBrandSearchChange = (value: string) => {
        setBrandSearchValue(value);
        
        // Check if the search value doesn't match any existing brands
        const brandExists = brandsList.some(brand => 
            brand.label.toLowerCase().includes(value.toLowerCase())
        );
        
        // If brand doesn't exist and user has typed something, pre-fill the modal
        if (!brandExists && value.trim()) {
            newBrandForm.setValues({ brandName: value });
        }
    };

    const getBrandSelectData = () => {
        if (brandSearchValue.trim() && !brandsList.some(brand => 
            brand.label.toLowerCase().includes(brandSearchValue.toLowerCase())
        )) {
            return [
                ...brandsList,
                { value: 'create-new', label: `Create "${brandSearchValue}"` }
            ];
        }
        return brandsList;
    };

    const handleBrandSelect = (value: string) => {
        if (value === 'create-new') {
            openBrandModal();
        } else {
            form.setValues({ brand: value });
        }
    };

    // Override the form's brand onChange to handle "create new" option
    const originalBrandOnChange = form.getInputProps("brand").onChange;
    const handleBrandChange = (value: string | null) => {
        if (value === 'create-new') {
            openBrandModal();
        } else if (value) {
            originalBrandOnChange?.(value);
        }
    };

    const openBrandModal = () => {
        // Pre-fill with current search value if it exists
        if (brandSearchValue.trim()) {
            newBrandForm.setValues({ brandName: brandSearchValue });
        }
        open();
    };

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
                <Button fullWidth onClick={() => saveNewBrand()} mt="md" loading={isCreatingBrand}>
                    {isCreatingBrand ? 'Creating...' : 'Submit'}
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
        setIsCreatingProduct(true);
        try {
            const body = {
                name: newProductForm.values.productName,
                vintage: newProductForm.values.productVintage,
                varietal: newProductForm.values.productVarietal,
                region: newProductForm.values.productRegion,
                brandId: form.values.brand,
            };
            const response = await fetch("/api/products", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            });
            
            if (response.ok) {
                const newProduct = await response.json();
                
                // Add the new product to the filtered products list
                const newProductOption = { 
                    value: newProduct.id, 
                    label: newProduct.name + " " + newProductForm.values.productVintage 
                };
                setProductsFiltered([...productsFiltered, newProductOption]);
                
                // Set the newly created product as selected
                form.setValues({ product: newProduct.id });
                
                // Reset the product search value
                setProductSearchValue('');
                
                // Reset the form
                newProductForm.reset();
                close();
            } else {
                console.error('Failed to create product');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreatingProduct(false);
        }
    }

    const handleProductSearchChange = (value: string) => {
        setProductSearchValue(value);
        
        // Check if the search value doesn't match any existing products
        const productExists = productsFiltered.some(product => 
            product.label.toLowerCase().includes(value.toLowerCase())
        );
        
        // If product doesn't exist and user has typed something, pre-fill the modal
        if (!productExists && value.trim()) {
            newProductForm.setValues({ productName: value });
        }
    };

    const getProductSelectData = () => {
        if (productSearchValue.trim() && !productsFiltered.some(product => 
            product.label.toLowerCase().includes(productSearchValue.toLowerCase())
        )) {
            return [
                ...productsFiltered,
                { value: 'create-new', label: `Create "${productSearchValue}"` }
            ];
        }
        return productsFiltered;
    };

    // Override the form's product onChange to handle "create new" option
    const originalProductOnChange = form.getInputProps("product").onChange;
    const handleProductChange = (value: string | null) => {
        if (value === 'create-new') {
            openProductModal();
        } else if (value) {
            originalProductOnChange?.(value);
        }
    };

    const openProductModal = () => {
        // Pre-fill with current search value if it exists
        if (productSearchValue.trim()) {
            newProductForm.setValues({ productName: productSearchValue });
        }
        open();
    };

    const handleCloseModal = () => {
        newBrandForm.reset();
        newProductForm.reset();
        setBrandSearchValue('');
        setProductSearchValue('');
        close();
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
                <Button fullWidth onClick={() => saveNewProduct()} mt="md" loading={isCreatingProduct}>
                    {isCreatingProduct ? 'Creating...' : 'Submit'}
                </Button>
            </>
        );
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
                            data={getBrandSelectData()}
                            searchable
                            searchValue={brandSearchValue}
                            onSearchChange={handleBrandSearchChange}
                            onChange={handleBrandChange}
                            value={form.values.brand}
                            error={form.errors.brand}
                        />

                    </Stepper.Step>

                    <Stepper.Step label="Pick Product" description="Second Step">
                        <Select
                            label="Product"
                            key={"product"}
                            withAsterisk
                            placeholder="Start typing..."
                            limit={5}
                            data={getProductSelectData()}
                            searchable
                            searchValue={productSearchValue}
                            onSearchChange={handleProductSearchChange}
                            onChange={handleProductChange}
                            value={form.values.product}
                            error={form.errors.product}
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

                    {active === 0 && <Button color="green" onClick={openBrandModal}><IconPlus/>Brand</Button>}
                    {active === 1 && <Button color="green" onClick={openProductModal}><IconPlus/>Product</Button>}
                    {active !== 2 && <Button onClick={nextStep}>Next step</Button>}
                    {active === 2 && <Button onClick={addBottle}>Add Bottle</Button>}
                </Group>

                <Modal opened={opened} onClose={handleCloseModal} title={active === 0 ? "Add New Brand" : "Add New Product"}>
                    {active === 0 ? newBrandModal() : null}
                    {active === 1 ? newProductModal() : null}
                </Modal>

            </Container>
        </>
    );
};

export default CreateBottleForm;

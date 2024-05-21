// * NEXTAUTH
import { useSession, signIn, signOut } from "next-auth/react";
import { Image, Text, Card, Center, Loader} from "@mantine/core";
import { IconGlassFull, IconFridge, IconBottle } from '@tabler/icons-react';
import { Container, Grid } from "@mantine/core";

export default function Page() {

  const {data: session, status: loading} = useSession();
  // const {sessionContext : sessionContext} = useSession();
  // const [ session , loading ] = useSession();

  if(loading === 'loading') {
    return (
        <Center>

          <Loader color="blue" size="lg" />

        </Center>
  )}


  if (session) {
    return (
        <>
          <Container>
            <Grid>
              <Grid.Col span={{base: 12, xs: 4}}>
                <Card
                    shadow="sm"
                    padding="xl"
                    radius="md"
                    component={"a"}
                    href="/bottles"
                    color="blue"
                    withBorder
                >
                  <Card.Section>
                    <Center>
                      <IconBottle color={"#d33131"} stroke={1.2} size={90}/>
                    </Center>
                  </Card.Section>
                  <Card.Section>
                    <Text
                        size="lg"
                        fw={800}
                        ta="center"
                        variant="gradient"
                        gradient={{from: 'red', to: 'maroon', deg: 90}}
                    >
                      Browse Your Bottles
                    </Text>
                  </Card.Section>
                </Card>
              </Grid.Col>
              <Grid.Col span={{base: 12, xs: 4}}>
                <Card
                    shadow="sm"
                    padding="xl"
                    radius="md"
                    component={"a"}
                    href="/stashes"
                    withBorder
                >
                  <Card.Section>
                    <Center>
                      <IconFridge color={"#d33131"} stroke={1.2} size={90}/>
                    </Center>
                  </Card.Section>
                  <Card.Section>
                    <Text
                        size="lg"
                        fw={800}
                        ta="center"
                        variant="gradient"
                        gradient={{from: 'red', to: 'maroon', deg: 90}}
                    >
                      Browse Your Stashes
                    </Text>
                  </Card.Section>
                </Card>
              </Grid.Col>

              <Grid.Col span={{base: 12, xs: 4}}>
                <Card
                    shadow="sm"
                    padding="xl"
                    radius="md"
                    component={"a"}
                    href="/brands"

                    withBorder
                >
                  <Card.Section>
                    <Center>
                      <IconGlassFull color={"#d33131"} stroke={1.2} size={90}/>
                    </Center>
                  </Card.Section>
                  <Card.Section>
                    <Text
                        size="lg"
                        fw={800}
                        ta="center"
                        variant="gradient"
                        gradient={{from: 'red', to: 'maroon', deg: 90}}
                    >
                      Browse All Brands
                    </Text>
                  </Card.Section>
                </Card>
              </Grid.Col>
            </Grid>
          </Container>
        </>
    );
  }

  else
    {
      return (
          <>
            <Container>
              <Text
                  size="lg"
                  fw={800}
                  ta="center"
                  variant="gradient"
                  gradient={{from: 'red', to: 'maroon', deg: 90}}
              >Know what you are sippin!</Text>

              <Text size="md"
                    fw={800}
                    ta="center"
                    variant="gradient"
                    gradient={{from: 'red', to: 'maroon', deg: 90}}
              >Login to start tracking your bottles</Text>

              {/*<Grid>*/}
              {/*  <Grid.Col span={{base: 12, xs: 4}}>*/}
              {/*    <Image src="/images/beer-fridge-animated.png" alt="Beer Fridge"/>*/}
              {/*  </Grid.Col>*/}
              {/*  <Grid.Col span={{base: 12, xs: 4}}>*/}
              {/*    <Image*/}
              {/*        src="/images/whiskey-cabinet-animated.png"*/}
              {/*        alt="Whiskey Cabinet"*/}
              {/*    />*/}
              {/*  </Grid.Col>*/}
              {/*  <Grid.Col span={{base: 12, xs: 4}}>*/}
              {/*    <Image src="/images/wine-fridge-animated.png" alt="Wine Fridge"/>*/}
              {/*  </Grid.Col>*/}
              {/*</Grid>*/}
            </Container>
          </>
      )
    };
  }

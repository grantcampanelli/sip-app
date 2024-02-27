// * NEXTAUTH
import { useSession, signIn, signOut } from "next-auth/react";
import { Image } from "@mantine/core";
import { Container, Grid } from "@mantine/core";

export default function Page() {
  const { data: session } = useSession();
  return (
    <>
      <Container>
        <Grid>
          <Grid.Col span={{ base: 12, xs: 4 }}>
            <Image src="/images/beer-fridge-animated.png" alt="Beer Fridge" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 4 }}>
            <Image
              src="/images/whiskey-cabinet-animated.png"
              alt="Whiskey Cabinet"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 4 }}>
            <Image src="/images/wine-fridge-animated.png" alt="Wine Fridge" />
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
}

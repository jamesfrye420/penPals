import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import NextLink from 'next/link';
import { useState } from 'react';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useForgotPasswordMutation } from '../../generated/graphql';

const ChangePassword: NextPage = () => {
  const [complete, setComplete] = useState(false);
  const [forgotPassword, { loading }] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: values });
          setComplete(true);
        }}
      >
        {() =>
          complete ? (
            <Flex flexDirection={'column'}>
              <Box>If an account with that email exists, we sent an email</Box>
              <NextLink href="/">
                <Link textDecoration={'underline'}>Back to home page</Link>
              </NextLink>
            </Flex>
          ) : (
            <Form>
              <InputField name="email" placeholder="Email" label="Email" type={'email'} />
              <Flex mt="1">
                <NextLink href="/login">
                  <Link ml={'auto'}>Back to Login</Link>
                </NextLink>
              </Flex>
              <Button mt={-9} colorScheme="teal" type="submit" isLoading={loading}>
                Confirm
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default ChangePassword;

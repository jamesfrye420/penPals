import React from 'react';
import NavBar from './NavBar';
import Wrapper, { WrapperVariant } from './Wrapper';

interface Props {
  variant?: WrapperVariant;
  children: React.ReactNode;
}

const Layout = ({ children, variant }: Props) => {
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};

export default Layout;

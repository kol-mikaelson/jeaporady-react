import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

function LitsocNav() {
  return (
    <>
      <Navbar className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="#home">
            <img
              alt=""
              src="src/assets/logo.jpeg"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Jeaporady from Litsoc
          </Navbar.Brand>
        </Container>
      </Navbar>
    </>
  );
}

export default LitsocNav;
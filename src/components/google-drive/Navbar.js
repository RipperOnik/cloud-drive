import React from 'react'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

export default function NavbarComponent() {
    return (
        <Navbar bg="light" expand="sm">
            <Container fluid>
                <Navbar.Brand as={Link} to="/">
                    Drive
                </Navbar.Brand>
                <Nav>
                    <Nav.Link as={Link} to="/user">
                        Profile
                    </Nav.Link>
                </Nav>
            </Container>


        </Navbar>
    )
}

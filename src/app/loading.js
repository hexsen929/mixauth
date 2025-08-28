"use client"
import React from 'react';
import styled from "styled-components";
import {CircularProgress} from "@mui/material";

const Container = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;

    .error {
        font-weight: bold;
        color: red;
    }
`

function Loading(props) {
    return (
        <Container>
            <CircularProgress/>
        </Container>
    );
}

export default Loading;
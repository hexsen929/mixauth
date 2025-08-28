import styled from "styled-components";


const DialogDiv = styled.div`
    display: flex;
    background-color: white;
    padding: 10px;
    border-radius: 10px;
    justify-content: center;
    width: 500px;
    max-width: 95vw;
    gap: 10px;
    flex-direction: column;
    color: #0b0414;
    word-break: break-all;

    > .content {
        padding: 20px;
        gap: 10px;
        display: flex;
        flex-direction: column;
        max-height: 60vh;
        overflow-y: auto;
    }

    p {
        white-space: nowrap;
        font-weight: bold;
    }
`
export default DialogDiv
// useApi.jsx

import {CircularProgress} from "@mui/material";
import styled from "styled-components";
import useProxyState from "./useProxyState.js";
import useDeepCompareEffect from "./useDeepCompareEffect.js";
import {noProxy, safeInterval} from "@/app/utils/CommonUtils";
import axios from "axios";
import axiosRetry from "axios-retry";

const MiddleContainer = styled.div`
    margin: 20px auto;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .error {
        font-weight: bold;
        color: red;
    }
`

export function DefaultLoading() {
    return <MiddleContainer>
        <CircularProgress/>
    </MiddleContainer>
}

export function DefaultError({err}) {
    return <MiddleContainer>
        <div className={'error'}>Error: {err.message ?? err}</div>
    </MiddleContainer>
}

const client = axios.create({})

axiosRetry(client, {
    maxRetries: 3,
    retryDelay() {
        return 100
    }
})


export default function useApi({
                                   path,
                                   method = 'GET',
                                   body = null,
                                   headers = {},
                                   config = {},
                                   callback = (data) => {
                                   },
                                   request = true,
                                   refreshInterval = -1,
                                   content = (data) => <></>,
                                   error = (err) => <DefaultError err={err}/>,
                                   loading = <DefaultLoading/>
                               }) {

    const state = useProxyState({
        err: null,
        data: null,
        isLoading: true,
    })

    const fetchData = async () => {
        const response = await client({
            ...config,
            url: path,
            method: method.toUpperCase(),
            data: body,
            headers,
        })
        state.data = noProxy(response.data)
        callback(state.data)
        state.err = null
    }

    useDeepCompareEffect(() => {
        if (!request) {
            return
        }

        (async () => {
            state.isLoading = true
            try {
                await fetchData()
            } catch (e) {
                console.error(e)
                state.err = e
            } finally {
                state.isLoading = false
            }
        })()

        if (refreshInterval > 0) {
            const stop = safeInterval(fetchData, refreshInterval)
            return () => stop()
        }
    }, [path, method, headers, config, body, refreshInterval])

    const {err, data, isLoading} = state

    function getContent() {
        if (isLoading) {
            return loading
        }
        if (err) {
            return error?.(err);
        }
        return content?.(data);
    }

    return {
        content: getContent(),
        data: data,
        isLoading,
        error: err,
    }
}


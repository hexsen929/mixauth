import {useEffect, useRef} from 'react';
import {deepEqual} from "@/app/utils/CommonUtils";


function useDeepCompareEffect(effect, dependencies) {
    const previousDepsRef = useRef(null);

    if (!previousDepsRef.current || !deepEqual(previousDepsRef.current, dependencies)) {
        previousDepsRef.current = dependencies;
    }

    useEffect(effect, [previousDepsRef.current]);
}

export default useDeepCompareEffect;

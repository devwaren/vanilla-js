import { useAnchor } from './useJSAnchor';
import { useJSSelect } from './useJSSelect';

const useJSNoReload = (DOM) => {
    if (!DOM) return;
    const anchors = useJSSelect("a", DOM)
    useAnchor(anchors);
};

export { useJSNoReload };

import { useJSElementEach } from './useJSForEach';
import { useJSSelect } from './useJSSelect';


const useJSHashAnchor = () => {
    const links = useJSSelect('a[href^="#"]')

    useJSElementEach(
        links,
        ['click'],
        (element, e) => {
            e.preventDefault();
            const targetId = element.getAttribute('href')?.substring(1);
            const targetElement = targetId ? document.getElementById(targetId) : null;

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    );
}

export { useJSHashAnchor }
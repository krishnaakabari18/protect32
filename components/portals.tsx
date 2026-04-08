'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Portals = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(<div id="portals" />, document.body);
};

export default Portals;

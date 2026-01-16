"use client";

import { motion } from "framer-motion";

export function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function SlideIn({ children, delay = 0, direction = "left", className = "" }: { children: React.ReactNode, delay?: number, direction?: "left" | "right" | "top" | "bottom", className?: string }) {
    const variants = {
        hidden: { 
            opacity: 0, 
            x: direction === "left" ? -20 : direction === "right" ? 20 : 0,
            y: direction === "top" ? -20 : direction === "bottom" ? 20 : 0
        },
        visible: { opacity: 1, x: 0, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.1, delayChildren: delay } }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function ScaleIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay, type: "spring", stiffness: 200 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

"use client"
import * as LR from "@uploadcare/blocks"
import { useRouter } from "next/navigation"
import React, { useEffect, useRef } from 'react'

type Props = {
    onUpload?: any // Defines a prop type for the component
}

// Registers Uploadcare blocks
LR.registerBlocks(LR)

const UploadCareButton = ({ onUpload }: Props) => {
    const router = useRouter() // Initialize router for navigation
    const ctxProviderRef = useRef<
        typeof LR.UploadCtxProvider.prototype & LR.UploadCtxProvider
    >(null) // Reference to the Uploadcare context provider

    useEffect(() => {
        const handleUpload = async (e: any) => {
            const file = await onUpload(e.detail.cdnUrl) // Call the onUpload function with the CDN URL
            if (file) {
                router.refresh() // Refresh the router if the file is uploaded successfully
            }
        }
        ctxProviderRef.current!.addEventListener('file-upload-success', handleUpload) // Add event listener for upload success
    }, []) // Empty dependency array ensures this effect runs only once

    return (
        <div>
            <lr-config
                ctx-name="my-uploader"
                pubkey="a9428ff5ff90ae7a64eb"
            />

            <lr-file-uploader-regular
                ctx-name="my-uploader"
                css-src={`https://cdn.jsdelivr.net/npm/@uploadcare/blocks@0.35.2/web/lr-file-uploader-regular.min.css`}
            />

            <lr-upload-ctx-provider
                ctx-name="my-uploader"
                ref={ctxProviderRef}
            />
        </div>
    )
}

export default UploadCareButton
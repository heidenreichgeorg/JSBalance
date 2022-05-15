import { Group, Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { Photo } from 'tabler-icons-react';

const dropzoneChildren = () => (
    <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
        <Photo color='gray' size={80} />
        <div>
            <Text size="xl" inline>
                Drag images here or click to select files
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed 5mb
            </Text>
        </div>
    </Group>
);

export default function WelcomePage() {
    return (
        <div>
            <h1>JSBalance</h1>
            <p>
                Welcome to JSBalance. This is a simple web application to help you keep track of your
                finances.
            </p>
            <p>
                Drop your <span>.json</span> File here
            </p>
            <Dropzone
                onDrop={(files) => console.log('accepted files', files)}
                onReject={(files) => console.log('rejected files', files)}
                maxSize={3 * 1024 ** 2}
                accept={'.json'}
            >
                {(status) => dropzoneChildren(status)}
            </Dropzone>
        </div>
    )
}
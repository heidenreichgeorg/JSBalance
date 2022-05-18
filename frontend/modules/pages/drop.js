import { useState } from 'react';

import { Group, Text, Title, Center, Space } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone'
import { FileCode2 } from 'tabler-icons-react';
import useLang from '../lang';

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onabort = () => reject('file reading was aborted')
        reader.onerror = () => reject('file reading has failed')
        reader.onload = () => resolve(reader.result)
        reader.readAsText(file)
    })
}

export default function DropPage({logIn}) {

    const lang = useLang();

    const [loading, setLoading] = useState(false);
    const [rejected, setRejected] = useState(false);

    async function handleDrop(files) {
        setRejected(false);
        setLoading(true);
        
        const fileContent = await readFile(files[0]);

        fetch('/api/upload', {
            method: 'POST',
            body: fileContent
        }).then(res => {
            if(res.ok) return res.json()
            else throw new Error('Upload failed')
        })
        .then(res => {
            if(res.accepted) {
                logIn();
            } else setRejected(true);
            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        });
    }

    function handleReject() {
        setRejected(true);
    }

    return (
        <Center
            style={{ minHeight: '100vh' }}
        >
            <div>
                <Title>{lang.title}</Title>
                <Text>{lang['upload']}</Text>
                <Space h="xl" />
                <Dropzone
                    onDrop={handleDrop}
                    onReject={handleReject}
                    accept={['.json']}
                    multiple={false}
                    loading={loading}
                >
                    {() => (
                        <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                            <FileCode2 color='gray' size={80} />
                            <div>
                                <Text size="xl" inline>{lang['drag files']}</Text>
                                <Text size="sm" color={rejected ? "red" : "dimmed"} inline mt={7}>{lang['upload file']}</Text>
                            </div>
                        </Group>
                    )}
                </Dropzone>
            </div>
        </Center>
    )
}
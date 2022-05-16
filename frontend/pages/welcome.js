import { Group, Text, Title, Center, Space } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone'
import { FileCode2 } from 'tabler-icons-react';
import useLang from '../modules/lang';

export default function WelcomePage() {

    const lang = useLang();

    return (
        <Center
            style={{ minHeight: '100vh' }}
        >
            <div>
                <Title>{lang.title}</Title>
                <Text>{lang['upload']}</Text>
                <Space h="xl" />
                <Dropzone
                    onDrop={(files) => console.log('accepted files', files)}
                    onReject={(files) => console.log('rejected files', files)}
                    accept={'.json'}
                    multiple={false}
                >
                    {(status) => (
                        <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                            <FileCode2 color='gray' size={80} />
                            <div>
                                <Text size="xl" inline>{lang['drag files']}</Text>
                                <Text size="sm" color="dimmed" inline mt={7}>{lang['upload file']}</Text>
                            </div>
                        </Group>
                    )}
                </Dropzone>
            </div>
        </Center>
    )
}
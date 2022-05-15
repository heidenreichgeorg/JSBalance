import { useState } from 'react';

import styles from '../styles/Home.module.scss';

import { Group, Input, Modal, InputWrapper, PasswordInput, Space, Button, Anchor, LoadingOverlay, Text, Card, Image, Badge } from '@mantine/core';
import { Mail, Lock} from 'tabler-icons-react';

function SignUp({setLoading, setOpened}) {
    const [firstname, setFirstname] = useState({data: ''});
    const [lastname, setLastname] = useState({data: ''});
    const [email, setEmail] = useState({data: ''});
    const [password, setPassword] = useState({data: ''});
    const [passwordConfirm, setPasswordConfirm] = useState({data: ''});

    const [error, setError] = useState('');

    const handleFirstnameChange = (e) => {
        setFirstname({'data': e.target.value});
    }
    const handleLastnameChange = (e) => {
        setLastname({'data': e.target.value});
    }
    const handleEmailChange = (e) => {
        setEmail({'data': e.target.value});
    }
    const handlePasswordChange = (e) => {
        setPassword({'data': e.target.value});
    }
    const handlePasswordConfirmChange = (e) => {
        setPasswordConfirm({'data': e.target.value});
    }
    const handleSubmit = async (e) => {
        setLoading(true);

        if(firstname.data == '') setFirstname({error: 'Firstname is required', data: firstname.data});
        else if(!/[a-zA-Z]+$/.test(firstname.data)) setFirstname({error: 'Firstname must be alphabetic', data: firstname.data});
        else setFirstname({data: firstname.data});
        
        if(lastname.data == '') setLastname({error: 'Lastname is required', data: lastname.data});
        else if(!/[a-zA-Z]+$/.test(lastname.data)) setLastname({error: 'Lastname must be alphabetic', data: lastname.data});
        else setLastname({data: lastname.data});

        if(email.data == '') setEmail({error: 'Email is required', data: email.data});
        else if(!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email.data)) setEmail({error: 'Email must be valid', data: email.data});
        else setEmail({data: email.data});

        if(password.data == '') setPassword({error: 'Password is required', data: password.data});
        // at least 8 characters
        else if(password.data.length < 8) setPassword({error: 'Password must at least 8 characters', data: password.data});
        // at least one number
        else if(!/\d/.test(password.data)) setPassword({error: 'Password must contain at least one number', data: password.data});
        // at least one uppercase letter
        else if(!/[A-Z]/.test(password.data)) setPassword({error: 'Password must contain at least one uppercase letter', data: password.data});
        // at least one special character
        else if(!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password.data)) setPassword({error: 'Password must contain at least one special character', data: password.data});
        else setPassword({data: password.data});

        if(passwordConfirm.data == '') setPasswordConfirm({error: 'Password is required', data: passwordConfirm.data});
        else if(password.data !== passwordConfirm.data) setPasswordConfirm({error: 'Passwords must match', data: passwordConfirm.data});
        else setFirstname({data: passwordConfirm.data});

        await new Promise(resolve => setTimeout(resolve, 500));

        if(!firstname.error && !lastname.error && !email.error && !password.error && !passwordConfirm.error) {
            if(!firstname.data || !lastname.data || !email.data || !password.data || !passwordConfirm.data) return setLoading(false);
            fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstname: firstname.data,
                    lastname: lastname.data,
                    email: email.data,
                    password: password.data
                })
            }).then(res => res.json())
            .then(data => {
                setLoading(false)
                if(data.success) setOpened('');
                else setError(data.error[0]);
            }).catch(e => {
                setLoading(false)
                setError('An error occured');
            })
        } else setLoading(false)
    }
    return (
        <>
            <Group grow>
                <InputWrapper label="First name" required error={firstname.error}>
                    <Input
                        placeholder="Your first name"
                        onChange={handleFirstnameChange}
                    ></Input>
                </InputWrapper>
                <InputWrapper label="Last name" required error={lastname.error}>
                    <Input
                        placeholder="Your last name"
                        onChange={handleLastnameChange}
                    ></Input>
                </InputWrapper>
            </Group>
            <InputWrapper label="Email" required error={email.error}>
                <Input
                    icon={<Mail color='gray'/>}
                    placeholder="Your email"
                    onChange={handleEmailChange}
                ></Input>
            </InputWrapper>
            <InputWrapper label="Password" required>
                <PasswordInput
                    icon={<Lock color='gray'/>}
                    placeholder="Your password"
                    onChange={handlePasswordChange}
                    error={password.error}
                ></PasswordInput>
            </InputWrapper>
            <InputWrapper label="Confirm Password" required>
                <PasswordInput
                    icon={<Lock color='gray'/>}
                    placeholder="Confirm password"
                    onChange={handlePasswordConfirmChange}
                    error={passwordConfirm.error}
                ></PasswordInput>
            </InputWrapper>
            {error ?
                <>
                    <Space h='sm' />
                    <Text color="red">{error}</Text>
                </>
            : null}
            <Space h="xl" />
            <Group style={{padding: '0 1rem'}}>
                <Anchor onClick={() => setOpened('Sign in')} style={{color: 'gray'}}>Have an account? Sign in</Anchor>
                <Button style={{marginLeft: 'auto'}} onClick={handleSubmit}>Sign up</Button>
            </Group>
        </>
    )
}

function SignIn({setLoading, setOpened}) {
    const [email, setEmail] = useState({data: ''});
    const [password, setPassword] = useState({data: ''});
    const [error, setError] = useState('');

    const handleEmailChange = (e) => {
        setEmail({data: e.target.value});
    }
    const handlePasswordChange = (e) => {
        setPassword({data: e.target.value});
    }
    const handleSubmit = async (e) => {
        setLoading(true);

        setError('');

        if(email.data == '') setEmail({error: 'Email is required', data: email.data});
        else if(!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email.data)) setEmail({error: 'Email must be valid', data: email.data});
        else setEmail({data: email.data});

        //check if password
        // is at least 8 characters
        // at least one number
        // at least one uppercase letter
        // at least one special character
        if(password.data == '') setPassword({error: 'Password is required', data: password.data});
        else setPassword({data: password.data});

        await new Promise(resolve => setTimeout(resolve, 500));

        if(!email.error && !password.error && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password.data)) setError('Email or password is wrong');

        if(!email.error && !password.error) {
            if(!email.data || !password.data) return setLoading(false);
            fetch('/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.data,
                    password: password.data
                })
            }).then(res => res.json())
            .then(data => {
                setLoading(false)
                if(data.success) setOpened('');
                else setError(data.error[0]);
            }).catch(e => {
                setLoading(false)
                setError('An error occured');
            })
        } else setLoading(false)
    }

    return (
        <>
            <InputWrapper label="Email" required error={email.error}>
                <Input
                    icon={<Mail color='gray'/>}
                    placeholder="Your email"
                    onChange={handleEmailChange}
                ></Input>
            </InputWrapper>
            <InputWrapper label="Password" required>
                <PasswordInput
                    error={password.error}
                    icon={<Lock color='gray'/>}
                    placeholder="Your password"
                    onChange={handlePasswordChange}
                ></PasswordInput>
            </InputWrapper>
            {error ?
                <>
                    <Space h='sm' />
                    <Text color="red">{error}</Text>
                </>
            : null}
            <Space h="xl" />
            <Group style={{padding: '0 1rem'}}>
                <Anchor onClick={() => setOpened("Sign up")} style={{color: "gray"}}>Don't have an account? Sign up</Anchor>
                <Button style={{marginLeft: 'auto'}} onClick={handleSubmit}>Sign in</Button>
            </Group>
        </>
    )
}

function Login() {

    const [opened, setOpened] = useState(undefined);
    const [loading, setLoading] = useState(false);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1 className={styles.title}>JSBalance</h1>
                <div className={styles.login}>
                    <a onClick={() => setOpened('Sign in')}>Sign in</a>
                    <a className="button" onClick={() => setOpened('Sign up')}>Sign Up</a>
                    <Modal
                        opened={opened === 'Sign in'}
                        onClose={() => setOpened(undefined)}
                        title={opened}
                        centered
                        overlayOpacity={0.5}
                        overlayBlur={.8}
                    >
                        <LoadingOverlay visible={loading} />
                        <SignIn setLoading={setLoading} setOpened={setOpened} />
                    </Modal>
                    <Modal
                        opened={opened === 'Sign up'}
                        onClose={() => setOpened(undefined)}
                        title={opened}
                        centered
                        overlayOpacity={0.5}
                        overlayBlur={.8}
                    >
                        <LoadingOverlay visible={loading} />
                        <SignUp setLoading={setLoading} setOpened={setOpened} />
                    </Modal>
                </div>
            </div>
            <Space h={50} />
            <Group position='center' spacing='xl'>
                <Card shadow="sm" p="lg" style={{height: 500, width: 400}}>
                    <Card.Section>
                        <Image height={200} width={400} src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&w=1000&q=80' alt="logo" />
                    </Card.Section>
                    <Space h="xl" />
                    <Group>
                        <Text size="lg" weight="bold">Lorem ipsum</Text>
                        <Badge color='pink'>NEW</Badge>
                    </Group>
                    <Text size="sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </Text>
                </Card>
                <Card shadow="sm" p="lg" style={{height: 500, width: 400}}>
                    <Card.Section>
                        <Image height={200} width={400} src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&w=1000&q=80' alt="logo" />
                    </Card.Section>
                    <Space h="xl" />
                    <Text size="lg" weight="bold">Lorem ipsum</Text>
                    <Text size="sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </Text>
                </Card>
                <Card shadow="sm" p="lg" style={{height: 500, width: 400}}>
                    <Card.Section>
                        <Image height={200} width={400} src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8&w=1000&q=80' alt="logo" />
                    </Card.Section>
                    <Space h="xl" />
                    <Text size="lg" weight="bold">Lorem ipsum</Text>
                    <Text size="sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </Text>
                </Card>
            </Group>
        </div>
    );
}

function Account() {
    return (
        <h2>Account</h2>
    );
}

export default function HomePage({isLoggedIn}) {
    if(isLoggedIn) return <Account />
    else return <Login />
}

export async function getServerSideProps() {
    return {props: {isLoggedIn: Math.random() > .5}}
}
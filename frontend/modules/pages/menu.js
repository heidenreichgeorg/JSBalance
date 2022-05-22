import { useState } from 'react';

import { Tabs, Title, Space, LoadingOverlay } from '@mantine/core';
import { ChartPie3, Notes } from 'tabler-icons-react';
import useLang from '../lang';

import { useQuery } from 'react-query'

export default function MenuPage() {
    
    const lang = useLang();

    const { isLoading, error, data } = useQuery('session', async () => {
        const res = await fetch('/api/session')
        return res.json()
    })

    var session;
    if(!isLoading && !error) session = data.data

    return (
        <div style={{'padding': '2rem'}}>
            <LoadingOverlay visible={isLoading || error} />
            <Title>{lang.title}</Title>
            <Space h='lg' />
            <Tabs grow position="center">
                <Tabs.Tab label={lang['statement of account']} icon={<Notes size={16} />}><StatementOfAccount isLoading={isLoading} data={session}/></Tabs.Tab>
                <Tabs.Tab label={lang['opening balance']} icon={<Notes size={16} />}><OpeningBalance /></Tabs.Tab>
                <Tabs.Tab label={lang['account overview']} icon={<Notes size={16} />}><AccountOverview /></Tabs.Tab>
                <Tabs.Tab label={lang['status']} icon={<Notes size={16} />}><Status /></Tabs.Tab>
                <Tabs.Tab label={lang['bookings']} icon={<Notes size={16} />}><Bookings /></Tabs.Tab>
                <Tabs.Tab label={lang['profit loss']} icon={<Notes size={16} />}><ProfitLoss /></Tabs.Tab>
                <Tabs.Tab label={lang['investment schedule']} icon={<Notes size={16} />}><InvestmentSchedule /></Tabs.Tab>
                <Tabs.Tab label={lang['result HGB275A2']} icon={<Notes size={16} />}><ResultHGB275A2 /></Tabs.Tab>
                <Tabs.Tab label={lang['balance with profit']} icon={<Notes size={16} />}><BalanceWithProfit /></Tabs.Tab>
                <Tabs.Tab label={lang['templates']} icon={<Notes size={16} />}><Templates /></Tabs.Tab>
                <Tabs.Tab label={lang['close']} icon={<Notes size={16} />}><Close /></Tabs.Tab>
                <Tabs.Tab label={lang['diagram']} icon={<ChartPie3 size={16} />}><Diagram /></Tabs.Tab>
            </Tabs>
        </div>
    )
}

function StatementOfAccount({ isLoading, data }) {

    const lang = useLang();

    if(isLoading) {
        return <div>{lang.loading}</div>
    }

    const names = data['Names']

    return (
        <>
            <Title>{lang['statement of account']}</Title>
            <Space h='lg' />
            <p>
                {JSON.stringify(data)}
            </p>
        </>
    )
}

function OpeningBalance() {
    
    const lang = useLang();

    return (
        <Title>{lang['opening balance']}</Title>
    )
}

function AccountOverview() {
        
    const lang = useLang();

    return (
        <Title>{lang['account overview']}</Title>
    )
}

function Status() {
        
    const lang = useLang();

    return (
        <Title>{lang['status']}</Title>
    )
}

function Bookings() {
        
    const lang = useLang();

    return (
        <Title>{lang['bookings']}</Title>
    )
}

function ProfitLoss() {
        
    const lang = useLang();

    return (
        <Title>{lang['profit loss']}</Title>
    )
}

function InvestmentSchedule() {
        
    const lang = useLang();

    return (
        <Title>{lang['investment schedule']}</Title>
    )
}

function ResultHGB275A2() {
        
    const lang = useLang();

    return (
        <Title>{lang['result HGB275A2']}</Title>
    )
}

function BalanceWithProfit() {
        
    const lang = useLang();

    return (
        <Title>{lang['balance with profit']}</Title>
    )
}

function Templates() {
        
    const lang = useLang();

    return (
        <Title>{lang['templates']}</Title>
    )
}

function Close() {
        
    const lang = useLang();

    return (
        <Title>{lang['close']}</Title>
    )
}

function Diagram() {
        
    const lang = useLang();

    return (
        <Title>{lang['diagram']}</Title>
    )
}
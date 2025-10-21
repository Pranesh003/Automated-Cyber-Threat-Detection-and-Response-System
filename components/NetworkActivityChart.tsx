import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NetworkDataPoint } from '../types';

interface NetworkActivityChartProps {
  data: NetworkDataPoint[];
}

const NetworkActivityChart: React.FC<NetworkActivityChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} label={{ value: 'MB/s', angle: -90, position: 'insideLeft', fill: '#94a3b8', dy: -10, dx: 10 }}/>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderColor: '#475569',
            color: '#cbd5e1'
          }}
          itemStyle={{ color: '#cbd5e1' }}
        />
        <Legend wrapperStyle={{fontSize: "12px"}}/>
        <Line type="monotone" dataKey="incoming" name="Incoming Traffic (MB/s)" stroke="#38bdf8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="outgoing" name="Outgoing Traffic (MB/s)" stroke="#f472b6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default NetworkActivityChart;
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AffiliateDashboard() {
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: ''
  });
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalReferrals: 0,
    activeCodes: 0
  });

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    // Fetch data from API route
    const response = await fetch('/api/affiliates');
    const data = await response.json();
    
    setCodes(data.codes);
    setStats(data.stats);
    
    // Generate default code suggestion
    const username = data.sellerUsername || 'USER';
    const random = Math.floor(1000 + Math.random() * 9000);
    setNewCode(prev => ({ ...prev, code: `${username}${random}` }));
  };

  const createAffiliateCode = async () => {
    const response = await fetch('/api/affiliates/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCode)
    });
    
    if (response.ok) {
      fetchAffiliateData();
      setNewCode({ ...newCode, code: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {stats.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCodes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Affiliate Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={newCode.code}
                onChange={e => setNewCode({ ...newCode, code: e.target.value })}
                placeholder="Enter code"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <select
                id="discountType"
                className="w-full p-2 border rounded"
                value={newCode.discountType}
                onChange={e => setNewCode({ ...newCode, discountType: e.target.value })}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {newCode.discountType === 'percentage' ? 'Percentage' : 'Amount (PKR)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                value={newCode.discountValue}
                onChange={e => setNewCode({ ...newCode, discountValue: e.target.value })}
                placeholder={newCode.discountType === 'percentage' ? '10' : '500'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxUses">Maximum Uses</Label>
              <Input
                id="maxUses"
                type="number"
                value={newCode.maxUses}
                onChange={e => setNewCode({ ...newCode, maxUses: e.target.value })}
                placeholder="Unlimited"
              />
            </div>
          </div>
          
          <Button onClick={createAffiliateCode} className="w-full">
            Create Affiliate Code
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Affiliate Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {codes.map(code => (
              <div key={code.id} className="border rounded p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-mono text-lg">{code.code}</p>
                    <p className="text-sm text-gray-500">
                      {code.discount_type === 'percentage' 
                        ? `${code.discount_value}% off` 
                        : `PKR ${code.discount_value} off`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>{code.current_uses}/{code.max_uses || 'Unlimited'}</p>
                    <p className="text-sm text-gray-500">Uses</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

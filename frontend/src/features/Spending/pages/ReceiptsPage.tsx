import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ReceiptIcon, PlusIcon, SearchIcon, CalendarIcon, FilterIcon, ShoppingBagIcon, CoffeeIcon, ShoppingCartIcon, FilmIcon, MoreHorizontalIcon, UploadIcon } from 'lucide-react';

// Mock function to fetch receipts data - replace with your actual API call
const fetchReceiptsData = async () => {
  // This would be your Supabase query or other data fetching mechanism
  return {
    receipts: [
      {
        id: '1',
        store: 'Whole Foods',
        date: new Date('2025-03-15'),
        total: 78.45,
        category: 'Groceries',
        items: 12,
        imageUrl: null
      },
      {
        id: '2',
        store: 'Amazon',
        date: new Date('2025-03-12'),
        total: 125.99,
        category: 'Shopping',
        items: 3,
        imageUrl: null
      },
      {
        id: '3',
        store: 'Starbucks',
        date: new Date('2025-03-10'),
        total: 12.85,
        category: 'Dining',
        items: 2,
        imageUrl: null
      },
      {
        id: '4',
        store: 'Movie Theater',
        date: new Date('2025-03-08'),
        total: 32.50,
        category: 'Entertainment',
        items: 3,
        imageUrl: null
      },
      {
        id: '5',
        store: 'Target',
        date: new Date('2025-03-05'),
        total: 95.67,
        category: 'Shopping',
        items: 8,
        imageUrl: null
      },
      {
        id: '6',
        store: 'Restaurant',
        date: new Date('2025-03-02'),
        total: 65.33,
        category: 'Dining',
        items: 4,
        imageUrl: null
      }
    ]
  };
};

// Helper function to get the appropriate icon for a category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Groceries':
      return <ShoppingCartIcon className="h-4 w-4" />;
    case 'Dining':
      return <CoffeeIcon className="h-4 w-4" />;
    case 'Shopping':
      return <ShoppingBagIcon className="h-4 w-4" />;
    case 'Entertainment':
      return <FilmIcon className="h-4 w-4" />;
    default:
      return <ReceiptIcon className="h-4 w-4" />;
  }
};

export default function ReceiptsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['receipts'],
    queryFn: fetchReceiptsData
  });

  const handleFileUpload = (e) => {
    // Handle file upload logic here
    console.log('File selected:', e.target.files[0]);
    // You would process the file here and call your LLM function
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading receipts...</div>;

  if (error) return <div className="text-red-500">Error loading receipts</div>;

  // Filter receipts based on search term and category
  const filteredReceipts = data!.receipts.filter(receipt => {
    const matchesSearch = searchTerm === '' ||
      receipt.store.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' ||
      receipt.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
          <p className="text-muted-foreground">Manage and view your uploaded receipts</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Upload Receipt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Receipt</DialogTitle>
              <DialogDescription>
                Upload an image of your receipt to extract data automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                <UploadIcon className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 mb-4">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 mb-4">Supports JPG, PNG or PDF</p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  id="receipt-upload"
                  onChange={handleFileUpload}
                />
                <Button asChild>
                  <label htmlFor="receipt-upload">Select File</label>
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Process Receipt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search receipts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* <Select value={categoryFilter} onValueChange={setCategoryFilter}> */}
        {/*   <SelectTrigger className="w-full sm:w-[180px]"> */}
        {/*     <div className="flex items-center"> */}
        {/*       <FilterIcon className="mr-2 h-4 w-4" /> */}
        {/*       {categoryFilter || 'All Categories'} */}
        {/*     </div> */}
        {/*   </SelectTrigger> */}
        {/*   <SelectContent> */}
        {/*     <SelectItem value="">All Categories</SelectItem> */}
        {/*     <SelectItem value="Groceries">Groceries</SelectItem> */}
        {/*     <SelectItem value="Dining">Dining</SelectItem> */}
        {/*     <SelectItem value="Shopping">Shopping</SelectItem> */}
        {/*     <SelectItem value="Entertainment">Entertainment</SelectItem> */}
        {/*     <SelectItem value="Other">Other</SelectItem> */}
        {/*   </SelectContent> */}
        {/* </Select> */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReceipts.map((receipt) => (
          <Card key={receipt.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={receipt.imageUrl} alt={receipt.store} />
                    <AvatarFallback>{receipt.store.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{receipt.store}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <CalendarIcon className="h-3 w-3" />
                      {format(receipt.date, 'PPP')}
                    </CardDescription>
                  </div>
                </div>
                <Badge className="flex items-center gap-1" variant="outline">
                  {getCategoryIcon(receipt.category)}
                  {receipt.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {receipt.items} {receipt.items === 1 ? 'item' : 'items'}
                </div>
                <div className="text-xl font-bold">
                  ${receipt.total.toFixed(2)}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" size="sm">View Details</Button>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredReceipts.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <ReceiptIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">No receipts found</h3>
          <p className="text-muted-foreground">
            {searchTerm || categoryFilter ?
              'Try adjusting your filters' :
              'Upload your first receipt to get started'}
          </p>
        </div>
      )}
    </div>
  );
}

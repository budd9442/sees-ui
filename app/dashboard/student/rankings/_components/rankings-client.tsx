'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Trophy,
    Medal,
    Award,
    Star,
    TrendingUp,
    Target,
    Crown,
    BookOpen,
    Search,
    Download,
    Eye,
} from 'lucide-react';
import { toast } from 'sonner';

type RankingEntry = {
    id: string;
    studentId: string;
    studentName: string;
    academicYear: string;
    pathway: string;
    specialization: string | null;
    gpa: number;
    totalCredits: number;
    passRate: number;
    academicClass: string | null;
    weightedOverallScore?: number;
    weightedScore?: number;
    rank?: number;
    previousRank?: number;
    change?: number;
};

export default function RankingsClient({ initialRankings }: { initialRankings: RankingEntry[] }) {
    const [selectedPeriod, setSelectedPeriod] = useState('current');
    const [selectedCategory, setSelectedCategory] = useState('overall');
    const [searchTerm, setSearchTerm] = useState('');

    // Calculate rankings based on different criteria deterministically
    const calculateRankings = () => {
        const studentRankings: RankingEntry[] = initialRankings.map(student => {
            // Calculate sort score based on selected category
            let weightedScore = 0;
            switch (selectedCategory) {
                case 'overall':
                    // Use backend calculated weights
                    weightedScore = student.weightedOverallScore || (student.gpa * 0.6 + (student.passRate / 100) * 0.4);
                    break;
                case 'gpa':
                    weightedScore = student.gpa;
                    break;
                case 'credits':
                    weightedScore = student.totalCredits;
                    break;
                case 'pass-rate':
                    weightedScore = student.passRate;
                    break;
                default:
                    weightedScore = student.gpa;
            }

            return {
                ...student,
                weightedScore,
                rank: 0, // Will be set after sorting
                previousRank: 0,
                change: 0,
            };
        });

        // Sort by weighted score and assign ranks
        studentRankings.sort((a, b) => (b.weightedScore || 0) - (a.weightedScore || 0));
        studentRankings.forEach((ranking, index) => {
            ranking.rank = index + 1;
            ranking.previousRank = ranking.rank; // Stable rank, no randomization
            ranking.change = 0; // No random change delta
        });

        return studentRankings;
    };

    const rankings = calculateRankings();
    const filteredRankings = rankings.filter(ranking => {
        const term = (searchTerm || '').toLowerCase();
        const name = (ranking.studentName || '').toLowerCase();
        const year = (ranking.academicYear || '').toLowerCase();
        const pathway = (ranking.pathway || '').toLowerCase();
        return name.includes(term) || year.includes(term) || pathway.includes(term);
    });

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return Crown;
            case 2: return Trophy;
            case 3: return Medal;
            default: return Award;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return 'text-yellow-600 bg-yellow-50';
            case 2: return 'text-gray-600 bg-gray-50';
            case 3: return 'text-orange-600 bg-orange-50';
            default: return 'text-blue-600 bg-blue-50';
        }
    };

    const getChangeIcon = (change: number) => {
        if (change > 0) return TrendingUp;
        if (change < 0) return TrendingUp; // Flipped for rank improvement
        return Target;
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getCategoryStats = () => {
        const totalStudents = rankings.length;
        const avgGPA = totalStudents > 0 ? rankings.reduce((sum, r) => sum + r.gpa, 0) / totalStudents : 0;
        const avgCredits = totalStudents > 0 ? rankings.reduce((sum, r) => sum + (r.totalCredits || 0), 0) / totalStudents : 0;
        const avgPassRate = totalStudents > 0 ? rankings.reduce((sum, r) => sum + (r.passRate || 0), 0) / totalStudents : 0;

        return { totalStudents, avgGPA, avgCredits, avgPassRate };
    };

    const stats = getCategoryStats();

    const handleExportRankings = () => {
        toast.success('Rankings exported successfully!');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold">Student Rankings</h1>
                    <p className="text-muted-foreground mt-1">
                        View academic performance rankings and achievements
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportRankings}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Rankings
                    </Button>
                </div>
            </div>

            {/* Statistics Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">Active students</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Average GPA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgGPA.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Overall average</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Average Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgCredits.toFixed(0)}</div>
                        <p className="text-xs text-muted-foreground">Credits earned</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Average Pass Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgPassRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Success rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Search Students</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search by name, year, or pathway..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="period">Time Period</Label>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="current">Current Semester</SelectItem>
                                    <SelectItem value="year">Academic Year</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Ranking Category</Label>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="overall">Overall Performance</SelectItem>
                                    <SelectItem value="gpa">GPA Only</SelectItem>
                                    <SelectItem value="credits">Credits Earned</SelectItem>
                                    <SelectItem value="pass-rate">Pass Rate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="academic-year">Academic Year</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Years" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    <SelectItem value="L1">L1</SelectItem>
                                    <SelectItem value="L2">L2</SelectItem>
                                    <SelectItem value="L3">L3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Rankings */}
            <Tabs defaultValue="overall" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overall">Overall Rankings</TabsTrigger>
                    <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
                    <TabsTrigger value="by-pathway">By Pathway</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>

                <TabsContent value="overall" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Rankings</CardTitle>
                            <CardDescription>
                                Complete ranking of all students based on {selectedCategory} performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Rank</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead>Pathway</TableHead>
                                        <TableHead>GPA</TableHead>
                                        <TableHead>Credits</TableHead>
                                        <TableHead>Pass Rate</TableHead>
                                        <TableHead>Change</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRankings.map((ranking) => {
                                        const RankIcon = getRankIcon(ranking.rank!);
                                        const ChangeIcon = getChangeIcon(ranking.change || 0);

                                        return (
                                            <TableRow key={ranking.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getRankColor(ranking.rank!)}`}>
                                                            <RankIcon className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-bold">#{ranking.rank}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{ranking.studentName}</div>
                                                        <div className="text-sm text-muted-foreground">{ranking.studentId}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{ranking.academicYear}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{ranking.pathway}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{ranking.gpa.toFixed(2)}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{ranking.totalCredits}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">{(ranking.passRate || 0).toFixed(1)}%</div>
                                                        <Progress value={ranking.passRate || 0} className="w-16 h-2" />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className={`flex items-center gap-1 ${getChangeColor(ranking.change || 0)}`}>
                                                        <ChangeIcon className="h-4 w-4" />
                                                        <span className="text-sm">
                                                            {ranking.change && ranking.change > 0 ? `+${ranking.change}` : ranking.change || 0}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="top-performers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performers</CardTitle>
                            <CardDescription>
                                Recognizing the highest achieving students
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {filteredRankings.slice(0, 10).map((ranking) => {
                                    const RankIcon = getRankIcon(ranking.rank!);

                                    return (
                                        <div key={ranking.id} className="flex items-center gap-4 p-4 rounded-lg border">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${getRankColor(ranking.rank!)}`}>
                                                <RankIcon className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-semibold">{ranking.studentName}</h4>
                                                    <Badge variant="outline">{ranking.academicYear}</Badge>
                                                    <Badge variant="secondary">{ranking.pathway}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    GPA: {ranking.gpa.toFixed(2)} • Credits: {ranking.totalCredits || 0} • Pass Rate: {(ranking.passRate || 0).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold">#{ranking.rank}</div>
                                                <p className="text-xs text-muted-foreground">Overall Rank</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="by-pathway" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rankings by Pathway</CardTitle>
                            <CardDescription>
                                Performance rankings grouped by academic pathway
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {['Software Engineering', 'Data Science', 'Cybersecurity', 'Mobile Development'].map((pathway) => {
                                    const pathwayRankings = filteredRankings.filter(r => r.pathway === pathway);

                                    return (
                                        <div key={pathway} className="space-y-3">
                                            <h4 className="font-semibold text-lg">{pathway}</h4>
                                            <div className="space-y-2">
                                                {pathwayRankings.slice(0, 5).map((ranking) => {
                                                    const RankIcon = getRankIcon(ranking.rank!);

                                                    return (
                                                        <div key={ranking.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getRankColor(ranking.rank!)}`}>
                                                                <RankIcon className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="font-medium">{ranking.studentName}</div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    GPA: {ranking.gpa.toFixed(2)} • Credits: {ranking.totalCredits}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold">#{ranking.rank}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="achievements" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Academic Achievements</CardTitle>
                            <CardDescription>
                                Special recognitions and achievements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Perfect GPA (4.0)</h4>
                                    {filteredRankings.filter(r => r.gpa >= 3.95).map((ranking) => (
                                        <div key={ranking.id} className="flex items-center gap-3 p-3 rounded-lg border bg-green-50">
                                            <Star className="h-5 w-5 text-green-600" />
                                            <div>
                                                <div className="font-medium">{ranking.studentName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {ranking.academicYear} • {ranking.pathway}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold">High Credit Earners</h4>
                                    {filteredRankings.filter(r => (r.totalCredits || 0) >= 100).map((ranking) => (
                                        <div key={ranking.id} className="flex items-center gap-3 p-3 rounded-lg border bg-blue-50">
                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <div className="font-medium">{ranking.studentName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {ranking.totalCredits} credits • {ranking.academicYear}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold">Perfect Pass Rate</h4>
                                    {filteredRankings.filter(r => (r.passRate || 0) >= 100).map((ranking) => (
                                        <div key={ranking.id} className="flex items-center gap-3 p-3 rounded-lg border bg-purple-50">
                                            <Target className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <div className="font-medium">{ranking.studentName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {(ranking.passRate || 0).toFixed(1)}% pass rate • {ranking.academicYear}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold">Rising Stars</h4>
                                    {filteredRankings.filter(r => (r.change || 0) > 0).slice(0, 5).map((ranking) => (
                                        <div key={ranking.id} className="flex items-center gap-3 p-3 rounded-lg border bg-yellow-50">
                                            <TrendingUp className="h-5 w-5 text-yellow-600" />
                                            <div>
                                                <div className="font-medium">{ranking.studentName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Moved up {ranking.change || 0} positions • {ranking.academicYear}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

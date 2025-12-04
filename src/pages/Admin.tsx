import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, ArrowLeft, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Team {
  id: string;
  team_name: string;
  score: number;
  total_questions: number;
  current_question: number;
  warnings: number;
  is_disqualified: boolean;
  is_completed: boolean;
  total_time_seconds: number | null;
  start_time: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchTeams();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('teams-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
        },
        () => {
          fetchTeams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('is_completed', { ascending: false })
      .order('score', { ascending: false })
      .order('total_time_seconds', { ascending: true });

    if (data) {
      setTeams(data as Team[]);
    }
    setIsLoading(false);
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all rankings? This will delete all team data.')) {
      return;
    }

    // Delete all teams using gte to match all UUIDs
    const { error } = await supabase
      .from('teams')
      .delete()
      .gte('created_at', '1970-01-01');
    
    if (error) {
      console.error('Reset error:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset rankings',
        variant: 'destructive',
      });
    } else {
      // Immediately clear local state
      setTeams([]);
      toast({
        title: 'Success',
        description: 'All rankings have been reset',
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Rank', 'Team Name', 'Score', 'Time (seconds)', 'Warnings', 'Status'];
    const rows = teams.map((team, index) => [
      index + 1,
      team.team_name,
      team.score,
      team.total_time_seconds || '-',
      team.warnings,
      team.is_disqualified ? 'Disqualified' : team.is_completed ? 'Completed' : 'In Progress',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-rankings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (team: Team) => {
    if (team.is_disqualified) {
      return <span className="px-2 py-1 text-xs rounded bg-neon-red/20 text-neon-red border border-neon-red/30">Disqualified</span>;
    }
    if (team.is_completed) {
      return <span className="px-2 py-1 text-xs rounded bg-neon-green/20 text-neon-green border border-neon-green/30">Completed</span>;
    }
    return <span className="px-2 py-1 text-xs rounded bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30">In Progress (Q{team.current_question + 1}/20)</span>;
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    navigate('/');
  };

  return (
    <div className="min-h-screen relative z-10 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-muted-foreground" />
            </button>
            <div>
              <h1 className="font-orbitron text-2xl md:text-3xl font-bold neon-text-cyan">
                ADMIN DASHBOARD
              </h1>
              <p className="font-rajdhani text-muted-foreground">
                Live Quiz Rankings & Monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-neon-red/50 text-neon-red hover:bg-neon-red/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset All
            </Button>
            <Button
              onClick={handleExportCSV}
              className="btn-glow-green"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card-glow rounded-xl p-4 text-center">
          <Users className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
          <p className="font-orbitron text-2xl neon-text-cyan">{teams.length}</p>
          <p className="font-rajdhani text-sm text-muted-foreground">Total Teams</p>
        </div>
        <div className="card-glow rounded-xl p-4 text-center">
          <p className="font-orbitron text-2xl text-neon-green">{teams.filter(t => t.is_completed).length}</p>
          <p className="font-rajdhani text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="card-glow rounded-xl p-4 text-center">
          <p className="font-orbitron text-2xl text-neon-yellow">{teams.filter(t => !t.is_completed && !t.is_disqualified).length}</p>
          <p className="font-rajdhani text-sm text-muted-foreground">In Progress</p>
        </div>
        <div className="card-glow rounded-xl p-4 text-center">
          <p className="font-orbitron text-2xl text-neon-red">{teams.filter(t => t.is_disqualified).length}</p>
          <p className="font-rajdhani text-sm text-muted-foreground">Disqualified</p>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="max-w-7xl mx-auto">
        <div className="card-glow rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/30 border-b border-border/30">
                  <th className="px-4 py-3 text-left font-orbitron text-sm text-muted-foreground">Rank</th>
                  <th className="px-4 py-3 text-left font-orbitron text-sm text-muted-foreground">Team Name</th>
                  <th className="px-4 py-3 text-center font-orbitron text-sm text-muted-foreground">Score</th>
                  <th className="px-4 py-3 text-center font-orbitron text-sm text-muted-foreground">Progress</th>
                  <th className="px-4 py-3 text-center font-orbitron text-sm text-muted-foreground">Time</th>
                  <th className="px-4 py-3 text-center font-orbitron text-sm text-muted-foreground">Warnings</th>
                  <th className="px-4 py-3 text-center font-orbitron text-sm text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <p className="font-rajdhani text-muted-foreground">Loading...</p>
                    </td>
                  </tr>
                ) : teams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <p className="font-rajdhani text-muted-foreground">No teams yet</p>
                    </td>
                  </tr>
                ) : (
                  teams.map((team, index) => (
                    <tr key={team.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`font-orbitron text-lg ${
                          index === 0 ? 'text-neon-yellow' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-amber-600' :
                          'text-foreground'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-rajdhani text-lg text-foreground">{team.team_name}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-3 bg-secondary/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-neon-green rounded-full transition-all"
                              style={{ width: `${(team.score / 20) * 100}%` }}
                            />
                          </div>
                          <span className="font-orbitron text-lg text-neon-green">{team.score}/20</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-rajdhani text-muted-foreground">
                          Q{team.current_question + 1}/20
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-orbitron text-foreground">
                          {formatTime(team.total_time_seconds)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-orbitron ${
                          team.warnings >= 3 ? 'text-neon-red' :
                          team.warnings >= 2 ? 'text-neon-yellow' :
                          'text-foreground'
                        }`}>
                          {team.warnings}/3
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(team)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

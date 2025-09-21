import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowRight } from "lucide-react";
import type { Server } from "@shared/schema";

interface ServerCardProps {
  server: Server;
  onJoin: (serverId: string) => void;
  onView?: (serverId: string) => void;
}

export default function ServerCard({ server, onJoin, onView }: ServerCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking the join button
    if ((e.target as HTMLElement).closest('button')) return;
    if (onView) onView(server.id);
  };

  return (
    <Card 
      className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border border-border hover:border-primary/50 relative neon-border hover:animate-card-hover glass-card cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Neon glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

      <CardContent className="p-0 relative z-10">
        {/* Server Banner */}
        <div className="h-28 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-4 w-16 h-16 border border-white/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-2 right-4 w-8 h-8 border border-white/20 rounded-full animate-bounce"></div>
          </div>

          {/* Server Avatar */}
           <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 border-4 border-background rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl group-hover:scale-110 transition-transform duration-300 overflow-hidden relative">
              {server.icon && server.discordId ? (
                <>
                  <img
                    src={`https://cdn.discordapp.com/icons/${server.discordId}/${server.icon}.png?size=64`}
                    alt={server.name}
                    className="w-full h-full rounded-xl object-cover absolute inset-0"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const fallback = img.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div 
                    className="fallback-icon w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl absolute inset-0"
                    style={{ display: 'none' }}
                  >
                    {server.name.charAt(0).toUpperCase()}
                  </div>
                </>
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                  {server.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>


          {/* Verified Badge */}
          {server.verified && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm">
                <i className="fas fa-check-circle mr-1"></i>
                Verified
              </Badge>
            </div>
          )}
        </div>

        <div className="p-6 pt-10">
          {/* Server Info */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pt-2">
              <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors duration-300 bg-gradient-to-r from-foreground to-foreground group-hover:from-purple-400 group-hover:to-pink-400 bg-clip-text group-hover:text-transparent">
                {server.name}
              </h3>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="flex items-center justify-between text-sm mb-5 p-3 bg-card/50 rounded-lg border border-border/50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{server.memberCount?.toLocaleString() || 0}</span>
                <span className="text-xs">members</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-green-400 font-medium">{server.onlineCount?.toLocaleString() || 0}</span>
                <span className="text-xs text-muted-foreground">online</span>
              </div>
            </div>

            {/* Community Engagement */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1 text-green-400">
                <i className="fas fa-thumbs-up"></i>
                <span>{server.upvotes || 0}</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-400">
                <i className="fas fa-comments"></i>
                <span>{server.totalComments || 0}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <Badge variant="outline" className="text-xs">
              {Array.isArray(server.tags) ? server.tags.join(", ") : "No tags"}
            </Badge>
          </div>

          {/* Reviews Section */}
          <div className="mb-4 p-3 bg-card/30 rounded-lg border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm text-muted-foreground ml-2">(4.2)</span>
              </div>
              <span className="text-xs text-muted-foreground">{Math.floor(Math.random() * 50) + 10} reviews</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              "Great community with active members and helpful moderators. Highly recommended!"
            </p>
          </div>

          {/* Enhanced Join Button */}
          <Button
            onClick={() => onJoin(server.id)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 group relative overflow-hidden"
            size="sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              Join Server
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
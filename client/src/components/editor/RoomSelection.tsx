import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';


const RoomSelection = () => {
  const [roomId, setRoomId] = useState('');
  const [guestName, setGuestName] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a room ID",
      });
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/editor/join-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId, guestName }),
      });
      if (response.ok) {
        navigate(`/editor?roomId=${roomId}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to join room. Please check the room ID.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect to the server.",
      });
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a room name",
      });
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/editor/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: newRoomName }),
      });
      if (response.ok) {
        const { roomId } = await response.json();
        navigate(`/editor?roomId=${roomId}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create room.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect to the server.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Join or Create Room</CardTitle>
          <CardDescription>
            Enter a room ID to join an existing room or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join">Join Room</TabsTrigger>
              <TabsTrigger value="create">Create Room</TabsTrigger>
            </TabsList>

            <TabsContent value="join">
              <form onSubmit={handleJoinRoom}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roomId">Room ID</Label>
                    <Input
                      id="roomId"
                      placeholder="Enter room ID"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestName">Guest Name (Optional)</Label>
                    <Input
                      id="guestName"
                      placeholder="Enter your name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Join Room
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="create">
              <form onSubmit={handleCreateRoom}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newRoomName">Room Name</Label>
                    <Input
                      id="newRoomName"
                      placeholder="Enter room name"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Room
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="text-sm text-gray-500 text-center">
          You'll be redirected to the editor once you join or create a room
        </CardFooter>
      </Card>
    </div>
  );
};

export default RoomSelection;
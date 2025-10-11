"use client";
import React, { useEffect } from "react";
import MenuLayout from "@/components/menulayout";
import Leadtrackingheader from "./component/leadtrackingheader";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import axios from "axios";
import { getToken } from "@/lib/token";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AddActivityModal from "@/components/compo/addactvityModal";
import Editlead from "./all/component/editlead";
import ConfirmProductModal from "./component/confirmModal";

interface Lead {
  name: string;
  email: string;
  product: [];
  id: string;
}

interface LeadStageProps {
  title: string;
  leads: any;
  onDrop: (lead: Lead, stage: string) => void;
}

interface DraggableLeadCardProps {
  lead: Lead;
  stage: string;
}

interface LeadTrack {
  contacted: [];
  negotiation: [];
  new: [];
  proposalsent: [];
  won: [];
}

export default function LeadTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [leadchangedata, setleadchangedata] = useState({});

  const fetchleadtracking = async () => {
    const token = getToken("authToken");
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/leadtracking`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setColumns(response.data.data);
      setLoading(false);
      setError(false);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const updatestatuschange = async (
    destinationStage: string,
    lead: string,
    index: string
  ) => {
    const token = getToken("authToken");
    try {
      const responce = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/leads/` + lead,
        {
          status: destinationStage,
          index: index,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchleadtracking();
  }, []);

  const [columns, setColumns] = useState<any>({});
  const [taskCounter, setTaskCounter] = useState(6);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId;
    const sourceItems = [...columns[sourceCol]];
    const destItems =
      sourceCol === destCol ? sourceItems : [...columns[destCol]];

    const [movedCard] = sourceItems.splice(result.source.index, 1);
    destItems.splice(result.destination.index, 0, movedCard);

    setColumns({
      ...columns,
      [sourceCol]: sourceItems,
      [destCol]: destItems,
    });
    if (result.destination.droppableId === "won") {
      setIsConfirmModal(true);
      setleadchangedata(result);
    } else {
      updatestatuschange(
        result.destination.droppableId,
        result.draggableId,
        result.destination.index
      ).catch((error) => {
        console.error("API update failed, rolling back", error);
        fetchleadtracking();
      });
    }
  };

  const [activityID, setActivityID] = useState<string | undefined>();
  const [activityOpen, setActivityOpen] = useState(false);

  const handleactivityclose = () => {
    setActivityOpen(false);
    setActivityID("");
  };

  const [editopen, seteditopen] = useState(false);
  const [selectleadid, setselectleadid] = useState<string>();
  const edithandle = async () => {
    seteditopen(false);
    setselectleadid("");
  };

  const handleclose = () => {
    setIsConfirmModal(false);
    fetchleadtracking()
  };

  return (
    <MenuLayout title="Lead Tracking">
      <div className="space-y-4 p-4">
        <Leadtrackingheader />
      </div>
      <div className="p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          {loading ? (
            <div className="flex gap-4">
              {[...Array(5)].map((_, colIndex) => (
                <div key={colIndex} className="w-60 space-y-4 pr-4">
                  <Skeleton className="h-8 w-full rounded-md mb-2" />

                  <div className="space-y-2">
                    {[...Array(3)].map((_, cardIndex) => (
                      <Card key={cardIndex} className="p-2">
                        <CardHeader className="p-1">
                          <Skeleton className="h-4 w-3/4 mb-1" />
                          <Skeleton className="h-3 w-full" />
                        </CardHeader>
                        <CardContent className="p-1">
                          <Skeleton className="h-3 w-2/3 mb-2" />
                          <div className="flex gap-1 mt-1">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-6 w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-red-500 text-lg">
                Failed to load lead tracking. Please try again.
              </p>
              <Button onClick={fetchleadtracking} className="mt-4">
                Retry
              </Button>
            </div>
          ) : (
            <div className="flex gap-4  overflow-x-auto overflow-y-hidden">
              {Object.keys(columns).map((col) => (
                <div
                  key={col}
                  className="bg-gray-100 p-2 h-[74vh] min-w-[200px]  rounded-md shadow-sm space-y-2 w-full"
                >
                  <h2 className="text-md mb-2 text-center border-b">
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                  </h2>
                  <div className="overflow-y-scroll scrollbar-none h-[96%]">
                    <Droppable isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping droppableId={col} direction="vertical">
                      {(provided: any) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="flex flex-col min-h-[300px] gap-2 w-full p-2 rounded tsransition-all"
                        >
                          {columns[col].map((item: any, index: any) => (
                            <Draggable
                              key={item._id}
                              draggableId={item._id}
                              index={index}
                            >
                              {(provided: any) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <Card className="cursor-grab shadow-sm border rounded-sm relative p-1 text-xs bg-white gap-0">
                                    <CardHeader className="p-1">
                                      {item?.products?.map((product: any) => {
                                        return (
                                          <Badge key={product} className="bg-red-100 text-red-600">
                                            {product.name}
                                          </Badge>
                                        );
                                      })}
                                      <CardTitle className="text-sm font-medium">
                                        {item.name.charAt(0).toUpperCase() + item.name.slice(1)} - {item.company}
                                      </CardTitle>
                                      <p className="text-[12px] text-gray-500 truncate">
                                        {item.phone}
                                      </p>
                                    </CardHeader>
                                    <CardContent className="p-1">
                                      {/* <p className="text-[10px] text-gray-800 font-medium">
                                        Product: {item.product}
                                      </p> */}
                                      <div className="flex flex-row gap-2 mt-1 flex-wrap z-100">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="flex items-center gap-1 px-1 py-0.5 text-[10px] text-gray-800"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            seteditopen(true);
                                            setselectleadid(item._id);
                                          }}
                                        >
                                          <Pencil size={10} /> 
                                        </Button>
                                        <Button
                                          variant="default"
                                          size="sm"
                                          className="flex items-center gap-1 px-1 py-0.5 text-[10px] "
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActivityOpen(true);
                                            setActivityID(item._id);
                                          }}
                                        >
                                          <PlusCircle size={10} /> 
                                        </Button>
                                      </div>
                                      <p className="text-[12px] text-gray-500 truncate mt-2">
                                       Assigned to {item.assignedTo.name}
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DragDropContext>
      </div>
      {editopen && (
        <Editlead
          isOpen={editopen}
          onClose={edithandle}
          leadid={selectleadid}
        />
      )}

      {activityOpen && (
        <AddActivityModal
          isOpen={activityOpen}
          onClose={handleactivityclose}
          leadid={activityID}
          onAddActivity={() => {}}
        />
      )}

      {isConfirmModal && (
        <ConfirmProductModal
          isOpen={isConfirmModal}
          onClose={handleclose}
          leadchangedata={leadchangedata}
          onError={() => {fetchleadtracking}}
        />
      )}
    </MenuLayout>
  );
}

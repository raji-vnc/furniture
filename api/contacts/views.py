from rest_framework.viewsets import ModelViewSet
from .serializers import ContactSerializer
from contacts.models import Contact
from rest_framework.decorators  import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status


class ContactViewSet(ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


@api_view(['PUT','DELETE'])
def contact_update_delete(request,pk):
    try:
        contact=Contact.objects.get(id=pk)
    except Contact.DoesNotExist:
        return Response({
            "message":'contact not found'
        },status=404)
    if request.method=='PUT':
        serializer=ContactSerializer(contact,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400)
    
    if request.method =='DELETE':
        contact.delete()
        return Response({"message":"contact deleted successfully"})
        
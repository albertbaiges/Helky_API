
# JDyn

## Albert Baiges

JDyn is a library build on top of AWS SDK for JavaScript v3 client-dynamodb
to take full advantage of the Promise Based bahaviour that that version provides.

Furthermore, JDyn offers the possibility of working directly with JavaScript Objects
since it perform internally all the necessary conversions to translate this object
into the values and objects that client-dynamodb requires. 

## Support

Currently JDyn only supports the GetItem, PutItem, UpdateItem, DeleteItem operations
which are the most used operations.

## Read

Due to how Dynamo DB is implemented if the path of an update does not exist, 
AWS SDK for JavaScript v3 client-dynamodb will throw an exception.
This means that there is the chance that UpdateItem operation fails due to
an inexistent attribute in the nest.

For cases like this on the UpdateItem operation there is the option to disable
the conversion from JSON and provide an update that has the fields similarly as
how AWS SDK for JavaScript v3 client-dynamodb expects them.


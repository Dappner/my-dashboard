FROM --platform=linux/amd64 public.ecr.aws/lambda/python:3.10-x86_64

# Set the working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy requirements file INTO the image
COPY requirements.txt .

# Install dependencies -- use --no-cache-dir to avoid cache issues
# Install directly into the standard site-packages location within the image
RUN pip install --no-cache-dir -r requirements.txt

# Copy function source code FROM the build context INTO the image
# The build context includes 'src/' because of 'patterns' in serverless.yml
COPY src/ ${LAMBDA_TASK_ROOT}/src/

# The CMD is not strictly needed for zip packaging but good practice
CMD [ "src.lambda_handler.lambda_handler" ]
